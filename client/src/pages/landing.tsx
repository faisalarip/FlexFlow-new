import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import workoutVideo from "@assets/generated_videos/intense_workout_commercial_montage.mp4";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Landing() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Video - Optimized for Mobile and Desktop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectFit: "cover" }}
      >
        <source src={workoutVideo} type="video/mp4" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/50 z-1"></div>

      {/* Main Content - Responsive */}
      <div className="relative z-10 text-center space-y-6 md:space-y-8 px-4">
        {/* App Logo and Name */}
        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <Activity className="text-red-600" size={44} />
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            FlexFlow Fitness
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-lg md:text-2xl text-gray-100 drop-shadow-md max-w-xs md:max-w-none">
          Your Complete Fitness Journey Starts Here
        </p>

        {/* Buttons - Stack on Mobile, Side-by-Side on Desktop */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-6 md:pt-8">
          <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 drop-shadow-lg w-full sm:w-auto" asChild>
            <a href="/onboarding">GET STARTED</a>
          </Button>
          <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 drop-shadow-lg w-full sm:w-auto" asChild>
            <a href="/auth-selection">I HAVE AN ACCOUNT</a>
          </Button>
        </div>

        {/* Install App Button */}
        {!isInstalled && (
          <div className="pt-4">
            {isInstallable ? (
              <Button
                size="lg"
                variant="ghost"
                className="text-sm md:text-base text-white/80 hover:text-white hover:bg-white/10"
                onClick={handleInstallClick}
                data-testid="button-install-app"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            ) : (
              <p className="text-xs md:text-sm text-white/60">
                Tip: Add to your home screen for the best experience
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
