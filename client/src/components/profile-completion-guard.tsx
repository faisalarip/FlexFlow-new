import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProfileEditor from "@/components/profile-editor";
import type { User } from "@shared/schema";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export default function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { user, isLoading } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user needs to complete their profile
      const userData = user as User;
      const needsProfileCompletion = !userData.firstName || !userData.lastName;
      setShowProfileSetup(needsProfileCompletion);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to FlexFlow!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let's complete your profile to personalize your fitness journey.
            </p>
          </div>

          <ProfileEditor 
            isOpen={true}
            setIsOpen={(open) => {
              if (!open) {
                // When profile editor closes, check if profile is now complete
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}