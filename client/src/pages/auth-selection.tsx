import { useState } from "react";
import { Activity, User, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthPage from "@/pages/auth";
import { useNewAuth } from "@/hooks/useNewAuth";
import { useLocation } from "wouter";

export default function AuthSelection() {
  const [authMode, setAuthMode] = useState<"selection" | "signin" | "signup">(() => {
    // Check if user came from onboarding flow, default to signup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'onboarding') {
      return "signup";
    }
    return "selection";
  });
  const { signIn } = useNewAuth();
  const [, setLocation] = useLocation();

  const handleAuthSuccess = (user: any, token: string) => {
    signIn(user, token);
    setLocation("/");
  };

  const handleBackToSelection = () => {
    setAuthMode("selection");
  };

  if (authMode === "signin" || authMode === "signup") {
    return (
      <div>
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            onClick={handleBackToSelection}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <AuthPage mode={authMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Activity className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to FlexFlow</h1>
          <p className="text-black font-semibold text-lg mb-2">Eat Clean, Think Smart, Train HARD!</p>
          <p className="text-red-100">Choose how you'd like to access your account</p>
        </div>

        {/* Auth Selection Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In Options</h2>
          
          {/* Create Account with Username/Password */}
          <Button
            onClick={() => setAuthMode("signup")}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-medium"
            data-testid="create-account-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <User className="w-6 h-6" />
              <div className="text-left">
                <div>Create New Account</div>
                <div className="text-sm text-red-100 font-normal">Set up with username & password</div>
              </div>
            </div>
          </Button>

          {/* Sign In with Username/Password */}
          <Button
            onClick={() => setAuthMode("signin")}
            variant="outline"
            className="w-full h-16 border-2 border-red-600 text-red-600 hover:bg-red-50 text-lg font-medium"
            data-testid="signin-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <Mail className="w-6 h-6" />
              <div className="text-left">
                <div>Sign In to Existing Account</div>
                <div className="text-sm text-gray-600 font-normal">Use username/email & password</div>
              </div>
            </div>
          </Button>


        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-sm">
Choose your preferred sign-in method to access all FlexFlow features.
          </p>
          <p className="text-red-200 text-xs mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}