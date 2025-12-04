import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-black hexagon-bg hexagon-pattern overflow-hidden flex flex-col items-center justify-center">
      {/* Hexagonal background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-28 opacity-20">
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="#dc2626" stroke="#dc2626" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-40 right-16 w-24 h-21 opacity-15">
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>
        <div className="absolute bottom-40 left-20 w-36 h-31 opacity-20">
          <svg viewBox="0 0 120 104" className="w-full h-full">
            <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* App Logo and Name */}
        <div className="flex flex-col items-center space-y-4">
          <Activity className="text-red-600" size={48} />
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            FlexFlow Fitness
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-xl md:text-2xl text-gray-300">
          Your Complete Fitness Journey Starts Here
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <a href="/onboarding">GET STARTED</a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
            <a href="/auth-selection">I HAVE AN ACCOUNT</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
