import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      data-testid="splash-screen"
    >
      <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Dumbbell className="w-20 h-20 text-primary relative z-10" strokeWidth={2.5} />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            FlexFlow Fitness
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide">
            Stay Strong Stay Fit
          </p>
        </div>
        
        <div className="flex space-x-1 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
