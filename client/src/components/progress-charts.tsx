import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Workout } from "@shared/schema";

interface WeightProgressData {
  exerciseNames: string[];
  maxWeights: number[];
  progressOverTime: { exerciseName: string; dates: string[]; weights: number[] }[];
}

declare global {
  interface Window {
    Chart: any;
  }
}

export default function ProgressCharts() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('7');
  
  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });
  
  const { data: weightProgress } = useQuery<WeightProgressData>({
    queryKey: ["/api/progress/weight"],
  });

  const frequencyChartRef = useRef<HTMLCanvasElement>(null);
  const weightChartRef = useRef<HTMLCanvasElement>(null);
  const frequencyChartInstance = useRef<any>(null);
  const weightChartInstance = useRef<any>(null);

  useEffect(() => {
    // Load Chart.js if not already loaded
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        initializeCharts();
      };
      document.head.appendChild(script);
    } else {
      initializeCharts();
    }
  }, [workouts, weightProgress, selectedPeriod]);

  const initializeCharts = () => {
    if (!workouts || !window.Chart) return;

    // Workout Frequency Chart
    if (frequencyChartRef.current) {
      const ctx = frequencyChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (frequencyChartInstance.current) {
          frequencyChartInstance.current.destroy();
        }
        
        // Process workout data based on selected period
        const days = parseInt(selectedPeriod);
        const periodDays = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return date;
        });

        const dailyWorkouts = periodDays.map(date => {
          return workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate.toDateString() === date.toDateString();
          }).length;
        });

        // Generate labels based on period
        let labels: string[];
        if (selectedPeriod === '7') {
          labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        } else if (selectedPeriod === '30') {
          labels = periodDays.map(date => `${date.getMonth() + 1}/${date.getDate()}`);
        } else {
          labels = periodDays.map(date => `${date.getMonth() + 1}/${date.getDate()}`);
        }

        frequencyChartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Workouts',
              data: dailyWorkouts,
              borderColor: '#1E40AF',
              backgroundColor: 'rgba(30, 64, 175, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      }
    }

    // Weight Progress Chart (using real workout data)
    if (weightChartRef.current && weightProgress) {
      const ctx = weightChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if (weightChartInstance.current) {
          weightChartInstance.current.destroy();
        }
        
        if (weightProgress.exerciseNames.length > 0) {
          // Create color palette for exercises
          const colors = [
            'rgba(30, 64, 175, 0.8)',
            'rgba(5, 150, 105, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ];
          
          weightChartInstance.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
              labels: weightProgress.exerciseNames,
              datasets: [{
                label: 'Max Weight (lbs)',
                data: weightProgress.maxWeights,
                backgroundColor: weightProgress.exerciseNames.map((_, i) => colors[i % colors.length]),
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      return `Max Weight: ${context.parsed.y} lbs`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Weight (lbs)'
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }
          });
        }
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Progress Overview</h3>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as '7' | '30' | '90')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          data-testid="progress-period-selector"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Workout Frequency</h4>
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
            <canvas ref={frequencyChartRef} className="max-w-full max-h-full"></canvas>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Weight Progress</h4>
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
            {!weightProgress ? (
              <div className="text-gray-500 text-sm text-center">
                <div className="animate-pulse mb-2">Loading...</div>
              </div>
            ) : weightProgress.exerciseNames.length === 0 ? (
              <div className="text-gray-500 text-sm text-center">
                <div className="mb-2">📊 No weight data yet</div>
                <div className="text-xs">Log workouts with weights to see your progress</div>
              </div>
            ) : (
              <canvas ref={weightChartRef} className="max-w-full max-h-full" data-testid="weight-progress-chart"></canvas>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
