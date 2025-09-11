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

          {/* Continue with Google */}
          <Button
            onClick={() => {
              localStorage.setItem('oauth-in-progress', 'true');
              window.location.href = '/auth/google';
            }}
            variant="outline"
            className="w-full h-16 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-lg font-medium"
            data-testid="google-signin-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="text-left">
                <div>Continue with Google</div>
                <div className="text-sm text-gray-600 font-normal">Quick and secure with your Google account</div>
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