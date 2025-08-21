import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Workout } from "@shared/schema";

declare global {
  interface Window {
    Chart: any;
  }
}

export default function ProgressCharts() {
  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const frequencyChartRef = useRef<HTMLCanvasElement>(null);
  const weightChartRef = useRef<HTMLCanvasElement>(null);

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
  }, [workouts]);

  const initializeCharts = () => {
    if (!workouts || !window.Chart) return;

    // Workout Frequency Chart
    if (frequencyChartRef.current) {
      const ctx = frequencyChartRef.current.getContext('2d');
      if (ctx) {
        // Process workout data for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const dailyWorkouts = last7Days.map(date => {
          return workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate.toDateString() === date.toDateString();
          }).length;
        });

        new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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

    // Weight Progress Chart (using sample data for demo)
    if (weightChartRef.current) {
      const ctx = weightChartRef.current.getContext('2d');
      if (ctx) {
        new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Bench Press', 'Squats', 'Deadlift', 'Rows'],
            datasets: [{
              label: 'Max Weight (lbs)',
              data: [185, 225, 275, 155],
              backgroundColor: [
                'rgba(30, 64, 175, 0.8)',
                'rgba(5, 150, 105, 0.8)', 
                'rgba(249, 115, 22, 0.8)',
                'rgba(168, 85, 247, 0.8)'
              ],
              borderRadius: 6
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
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Progress Overview</h3>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
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
            <canvas ref={weightChartRef} className="max-w-full max-h-full"></canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
