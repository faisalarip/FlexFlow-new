import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, Clock, MapPin, Star, ArrowRight, CheckCircle, Zap } from "lucide-react";

interface PersonalizedPlan {
  title: string;
  description: string;
  workoutsPerWeek: number;
  sessionDuration: string;
  equipment: string[];
  features: string[];
  planType: 'beginner' | 'intermediate' | 'advanced';
  calories?: {
    bmr: number;
    tdee: number;
    goal: number;
    recommendation: string;
  };
}

const calculateCalories = (answers: any) => {
  const age = parseInt(answers.age) || 25;
  const heightFeet = parseInt(answers.heightFeet) || 5;
  const heightInches = parseInt(answers.heightInches) || 8;
  const weight = parseFloat(answers.weight) || 160;
  const weightUnit = answers.weightUnit || 'lbs';
  const goalWeight = parseFloat(answers.goalWeight) || weight;
  const fitnessGoal = answers.fitnessGoal || '';
  const workoutFrequency = answers.workoutFrequency || '';

  // Convert height to cm
  const heightCm = (heightFeet * 12 + heightInches) * 2.54;
  
  // Convert weight to kg if needed
  const weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
  const goalWeightKg = weightUnit === 'lbs' ? goalWeight * 0.453592 : goalWeight;

  // Calculate BMR using Mifflin-St Jeor Equation
  // For simplicity, using male formula as average (female formula subtracts 161 instead of adding 5)
  const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;

  // Determine activity multiplier based on workout frequency
  let activityMultiplier = 1.2; // Sedentary
  if (workoutFrequency.includes('2-3 times')) {
    activityMultiplier = 1.375; // Lightly active
  } else if (workoutFrequency.includes('3-4 times')) {
    activityMultiplier = 1.55; // Moderately active
  } else if (workoutFrequency.includes('4-5 times')) {
    activityMultiplier = 1.725; // Very active
  } else if (workoutFrequency.includes('5-6 times') || workoutFrequency.includes('6-7 times')) {
    activityMultiplier = 1.9; // Extremely active
  }

  const tdee = bmr * activityMultiplier;

  // Calculate goal calories based on fitness goal
  let goalCalories = tdee;
  let recommendation = '';

  if (fitnessGoal.includes('weight') || fitnessGoal.includes('fat')) {
    // Weight loss: 500-750 calorie deficit
    goalCalories = tdee - 500;
    recommendation = 'calorie deficit for healthy weight loss (1-2 lbs per week)';
  } else if (fitnessGoal.includes('muscle') || fitnessGoal.includes('strength')) {
    // Muscle gain: 300-500 calorie surplus
    goalCalories = tdee + 300;
    recommendation = 'calorie surplus for muscle building and strength gains';
  } else if (fitnessGoal.includes('endurance') || fitnessGoal.includes('performance')) {
    // Endurance: maintenance calories
    goalCalories = tdee;
    recommendation = 'maintenance calories to fuel your endurance training';
  } else {
    // General health: maintenance calories
    goalCalories = tdee;
    recommendation = 'maintenance calories for overall health and wellness';
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    goal: Math.round(goalCalories),
    recommendation
  };
};

const generatePlan = (answers: any): PersonalizedPlan => {
  // Get the actual user answers
  const fitnessGoal = answers.fitnessGoal || '';
  const experience = answers.experience || '';
  const consistency = answers.consistency || '';
  const location = answers.location || '';
  const workoutFrequency = answers.workoutFrequency || '';
  const workoutDuration = answers.workoutDuration || '';

  // Calculate personalized calorie recommendations
  const calories = calculateCalories(answers);

  // Determine plan complexity based on experience and consistency
  let planType: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let workoutsPerWeek = 2;
  let sessionDuration = "20-30 minutes";

  // Use user's preferred workout frequency if provided
  if (workoutFrequency.includes('2-3 times')) {
    workoutsPerWeek = 3;
  } else if (workoutFrequency.includes('3-4 times')) {
    workoutsPerWeek = 4;
  } else if (workoutFrequency.includes('4-5 times')) {
    workoutsPerWeek = 5;
  } else if (workoutFrequency.includes('5-6 times')) {
    workoutsPerWeek = 6;
  } else if (workoutFrequency.includes('6-7 times')) {
    workoutsPerWeek = 7;
  }

  // Use user's preferred session duration if provided
  if (workoutDuration.includes('15-30 minutes')) {
    sessionDuration = "15-30 minutes";
  } else if (workoutDuration.includes('30-45 minutes')) {
    sessionDuration = "30-45 minutes";
  } else if (workoutDuration.includes('45-60 minutes')) {
    sessionDuration = "45-60 minutes";
  } else if (workoutDuration.includes('60-75 minutes')) {
    sessionDuration = "60-75 minutes";
  } else if (workoutDuration.includes('75+ minutes')) {
    sessionDuration = "75+ minutes";
  }

  // Experience-based adjustments
  if (experience.includes('Advanced') || experience.includes('5+ years')) {
    planType = 'advanced';
    workoutsPerWeek = 6;
    sessionDuration = "60-75 minutes";
  } else if (experience.includes('Experienced') || experience.includes('2+ years')) {
    planType = 'intermediate';
    workoutsPerWeek = 5;
    sessionDuration = "45-60 minutes";
  } else if (experience.includes('Moderate') || experience.includes('6 months to 2 years')) {
    planType = 'intermediate';
    workoutsPerWeek = 4;
    sessionDuration = "40-50 minutes";
  } else if (experience.includes('Some experience')) {
    planType = 'beginner';
    workoutsPerWeek = 3;
    sessionDuration = "25-35 minutes";
  }

  // Consistency-based adjustments
  if (consistency.includes('Daily workouts')) {
    workoutsPerWeek = Math.max(workoutsPerWeek, 6);
    sessionDuration = "45-60 minutes";
  } else if (consistency.includes('5-6 times')) {
    workoutsPerWeek = Math.max(workoutsPerWeek, 5);
  } else if (consistency.includes('3-4 times')) {
    workoutsPerWeek = Math.max(workoutsPerWeek, 4);
  } else if (consistency.includes('1-2 times')) {
    workoutsPerWeek = Math.min(workoutsPerWeek, 3);
    sessionDuration = "30-40 minutes";
  } else if (consistency.includes('Just getting started')) {
    workoutsPerWeek = 2;
    sessionDuration = "20-30 minutes";
  }

  // Equipment recommendations based on workout location
  let equipment: string[] = [];
  if (location.includes('no equipment')) {
    equipment = ['Bodyweight exercises', 'Resistance bands', 'Yoga mat', 'Water bottles as weights'];
  } else if (location.includes('basic equipment')) {
    equipment = ['Adjustable dumbbells', 'Resistance bands', 'Yoga mat', 'Pull-up bar', 'Kettlebell'];
  } else if (location.includes('gym') || location.includes('fitness center')) {
    equipment = ['Full gym access', 'Barbells & dumbbells', 'Cable machines', 'Cardio equipment', 'Free weights'];
  } else if (location.includes('Outdoor')) {
    equipment = ['Bodyweight exercises', 'Running/walking paths', 'Park benches & equipment', 'Resistance bands'];
  } else if (location.includes('Multiple locations')) {
    equipment = ['Adaptive equipment', 'Portable gear', 'Bodyweight routines', 'Gym & home options'];
  }

  // Goal-specific features and plan customization
  let features: string[] = [];
  let planTitle = '';
  let planDescription = '';

  if (fitnessGoal.includes('weight') || fitnessGoal.includes('fat')) {
    planTitle = 'Fat Loss & Weight Management Plan';
    planDescription = 'Designed to help you burn fat, lose weight, and improve your body composition through targeted cardio and strength training.';
    features = [
      'HIIT cardio workouts for maximum calorie burn',
      'Strength training to preserve muscle mass',
      'Nutrition guidance for calorie deficit',
      'Progress tracking with body measurements',
      'Metabolic conditioning circuits',
      'Recovery and rest day planning'
    ];
  } else if (fitnessGoal.includes('muscle') || fitnessGoal.includes('strength')) {
    planTitle = 'Muscle Building & Strength Plan';
    planDescription = 'Focus on building lean muscle mass and increasing strength through progressive resistance training and optimal nutrition.';
    features = [
      'Progressive overload strength training',
      'Compound movement focus (squats, deadlifts, bench)',
      'Muscle-building nutrition protocols',
      'Detailed workout logs and PR tracking',
      'Hypertrophy-focused rep ranges',
      'Strategic rest and recovery periods'
    ];
  } else if (fitnessGoal.includes('endurance') || fitnessGoal.includes('cardio')) {
    planTitle = 'Endurance & Cardiovascular Plan';
    planDescription = 'Build cardiovascular fitness, improve endurance, and enhance your aerobic capacity through structured cardio training.';
    features = [
      'Progressive cardio training zones',
      'Long-distance and interval training',
      'Heart rate monitoring guidance',
      'Endurance nutrition strategies',
      'Running, cycling, and swimming workouts',
      'VO2 max improvement protocols'
    ];
  } else if (fitnessGoal.includes('Athletic') || fitnessGoal.includes('performance')) {
    planTitle = 'Athletic Performance Enhancement Plan';
    planDescription = 'Elite-level training designed to improve athletic performance, power, speed, and sport-specific skills.';
    features = [
      'Sport-specific movement patterns',
      'Power and explosiveness training',
      'Agility and speed development',
      'Performance analytics and testing',
      'Competition preparation protocols',
      'Advanced recovery techniques'
    ];
  } else if (fitnessGoal.includes('health') || fitnessGoal.includes('wellness')) {
    planTitle = 'General Health & Wellness Plan';
    planDescription = 'A balanced approach to fitness focusing on overall health, mobility, and sustainable lifestyle habits.';
    features = [
      'Balanced strength and cardio training',
      'Mobility and flexibility routines',
      'Stress management through exercise',
      'Sustainable healthy habits',
      'Functional movement patterns',
      'Holistic wellness approach'
    ];
  }

  return {
    title: planTitle,
    description: planDescription,
    workoutsPerWeek,
    sessionDuration,
    equipment,
    features,
    planType,
    calories
  };
};

export default function OnboardingPlan() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get answers from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const answers = {
      fitnessGoal: urlParams.get('fitnessGoal') || '',
      experience: urlParams.get('experience') || '',
      consistency: urlParams.get('consistency') || '',
      location: urlParams.get('location') || '',
      age: urlParams.get('age') || '',
      heightFeet: urlParams.get('heightFeet') || '',
      heightInches: urlParams.get('heightInches') || '',
      weight: urlParams.get('weight') || '',
      weightUnit: urlParams.get('weightUnit') || 'lbs',
      goalWeight: urlParams.get('goalWeight') || '',
      workoutFrequency: urlParams.get('workoutFrequency') || '',
      workoutDuration: urlParams.get('workoutDuration') || ''
    };

    // Generate plan based on actual user answers
    setTimeout(() => {
      const generatedPlan = generatePlan(answers);
      setPlan(generatedPlan);
      setLoading(false);
    }, 1500); // Simulate plan generation time
  }, []);

  const handleStartTrial = () => {
    setLocation('/onboarding/payment');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        </div>

        <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary" size={32} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Creating Your Personal Plan</h2>
            <p className="text-gray-600 dark:text-gray-300">Analyzing your answers to build the perfect fitness routine...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-56 h-56 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full blur-2xl opacity-25 animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-15 animate-ping" style={{animationDuration: '6s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Activity className="text-primary" size={32} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="text-green-500 w-16 h-16" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Personal Plan is Ready!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Based on your answers, we've created a customized fitness plan just for you.
          </p>
        </div>

        {/* Plan Card */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-3">
              <Badge variant={plan.planType === 'advanced' ? 'default' : plan.planType === 'intermediate' ? 'secondary' : 'outline'} 
                     className="text-sm px-4 py-1">
                {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)} Level
              </Badge>
            </div>
            <CardTitle className="text-2xl mb-2">{plan.title}</CardTitle>
            <CardDescription className="text-lg">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Plan Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <Target className="text-primary w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{plan.workoutsPerWeek}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Workouts per week</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Clock className="text-secondary w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-bold text-secondary">{plan.sessionDuration}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Per session</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <MapPin className="text-accent w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-bold text-accent">Flexible</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Location options</div>
              </div>
            </div>

            {/* Personalized Calorie Recommendations */}
            {plan.calories && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  Your Personalized Calorie Plan
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{plan.calories.bmr}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">BMR (Base Metabolic Rate)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{plan.calories.tdee}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">TDEE (Total Daily Energy)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{plan.calories.goal}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Goal Calories</div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300">
                    We recommend consuming <strong>{plan.calories.goal} calories per day</strong> - a {plan.calories.recommendation}
                  </p>
                </div>
              </div>
            )}

            {/* Equipment */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Recommended Equipment
              </h3>
              <div className="flex flex-wrap gap-2">
                {plan.equipment.map((item, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                What's Included
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 mb-4" 
                onClick={handleStartTrial}
                data-testid="start-trial-button"
              >
                Start Your 7-Day Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No commitment • Cancel anytime • Full access to all features
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}