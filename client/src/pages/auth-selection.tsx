import { useState } from "react";
import { Activity, User, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthPage from "@/pages/auth";
import { useNewAuth } from "@/hooks/useNewAuth";
import { useLocation } from "wouter";

export default function AuthSelection() {
  const [authMode, setAuthMode] = useState<"selection" | "signin" | "signup">("selection");
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
        <AuthPage mode={authMode} onAuthSuccess={handleAuthSuccess} />
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

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Continue with Replit (existing auth) */}
          <Button
            onClick={() => window.location.href = "/api/login"}
            variant="outline"
            className="w-full h-16 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-lg font-medium"
            data-testid="replit-auth-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                R
              </div>
              <div className="text-left">
                <div>Continue with Replit</div>
                <div className="text-sm text-gray-600 font-normal">Use your existing Replit account</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-sm">
            Both options give you full access to all FlexFlow features.
          </p>
          <p className="text-red-200 text-xs mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}