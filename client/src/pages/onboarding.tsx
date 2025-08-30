import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingAnswers {
  fitnessGoal: string;
  experience: string;
  consistency: string;
  location: string;
}

const questions = [
  {
    id: 'fitnessGoal',
    question: 'What is your fitness goal?',
    options: [
      'Lose weight and burn fat',
      'Build muscle and gain strength', 
      'Improve endurance and cardio',
      'General health and wellness',
      'Athletic performance enhancement'
    ]
  },
  {
    id: 'experience',
    question: 'How much strength training experience do you have?',
    options: [
      'Complete beginner - never lifted weights',
      'Some experience - less than 6 months',
      'Moderate experience - 6 months to 2 years',
      'Experienced - 2+ years of consistent training',
      'Advanced - 5+ years with extensive knowledge'
    ]
  },
  {
    id: 'consistency',
    question: 'How consistent are you with working out?',
    options: [
      'Just getting started - no routine yet',
      '1-2 times per week when I can',
      '3-4 times per week regularly',
      '5-6 times per week consistently',
      'Daily workouts are part of my lifestyle'
    ]
  },
  {
    id: 'location',
    question: 'Where do you normally workout?',
    options: [
      'At home with no equipment',
      'At home with basic equipment',
      'Local gym or fitness center',
      'Outdoor spaces (parks, trails, etc.)',
      'Multiple locations depending on the day'
    ]
  }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    fitnessGoal: '',
    experience: '',
    consistency: '',
    location: ''
  });

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Pass answers to plan generation page
      const queryParams = new URLSearchParams();
      Object.entries(answers).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      setLocation(`/onboarding/plan?${queryParams.toString()}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isCurrentAnswered = answers[currentQuestion.id as keyof OnboardingAnswers] !== '';

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
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Let's Create Your Personal Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Answer a few quick questions to get a customized fitness plan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentQuestion.question}
            </CardTitle>
            <CardDescription className="text-center">
              Select the option that best describes you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestion.id as keyof OnboardingAnswers] === option ? "default" : "outline"}
                className="w-full h-auto p-4 text-left justify-start hover:scale-105 transition-all"
                onClick={() => handleAnswerSelect(option)}
                data-testid={`option-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    answers[currentQuestion.id as keyof OnboardingAnswers] === option 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id as keyof OnboardingAnswers] === option && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-wrap">{option}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
            data-testid="previous-button"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className="flex items-center space-x-2"
            data-testid="next-button"
          >
            <span>{currentStep === questions.length - 1 ? 'Create My Plan' : 'Next'}</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}