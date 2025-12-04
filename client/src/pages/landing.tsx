import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import workoutVideo from "@assets/generated_videos/intense_athletic_performance_transformation.mp4";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={workoutVideo} type="video/mp4" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/50 z-1"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* App Logo and Name */}
        <div className="flex flex-col items-center space-y-4">
          <Activity className="text-red-600" size={48} />
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            FlexFlow Fitness
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-xl md:text-2xl text-gray-100 drop-shadow-md">
          Your Complete Fitness Journey Starts Here
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
          <Button size="lg" className="text-lg px-8 py-4 drop-shadow-lg" asChild>
            <a href="/onboarding">GET STARTED</a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-4 drop-shadow-lg" asChild>
            <a href="/auth-selection">I HAVE AN ACCOUNT</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
