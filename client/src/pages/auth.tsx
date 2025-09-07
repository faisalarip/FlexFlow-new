import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, User, Mail, Lock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { signUpSchema, signInSchema, type SignUpData, type SignInData } from "@shared/schema";
import { useNewAuth } from "@/hooks/useNewAuth";
import { useLocation } from "wouter";
import { z } from "zod";

interface AuthPageProps {
  mode?: "signin" | "signup";
}

export default function AuthPage({ mode = "signup" }: AuthPageProps) {
  const [isSignIn, setIsSignIn] = useState(mode === "signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useNewAuth();
  const [, setLocation] = useLocation();

  // Sign up form
  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  // Sign in form
  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (userData: SignUpData) => {
      const response = await apiRequest("POST", "/api/auth/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Welcome to FlexFlow!",
        description: "Your account has been created successfully.",
      });
      signIn(data.user, data.token);
      // Small delay to ensure state updates before navigation
      setTimeout(() => setLocation('/'), 100);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create account";
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (credentials: SignInData) => {
      const response = await apiRequest("POST", "/api/auth/signin", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      signIn(data.user, data.token);
      // Small delay to ensure state updates before navigation
      setTimeout(() => setLocation('/'), 100);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Invalid credentials";
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSignUp = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  const handleSignIn = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Store a flag to handle the OAuth callback
    localStorage.setItem('oauth-in-progress', 'true');
    window.location.href = '/api/auth/google';
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    signUpForm.reset();
    signInForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Dumbbell className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FlexFlow</h1>
          <p className="text-red-100">
            {isSignIn ? "Welcome back! Sign in to continue your fitness journey." : "Join thousands of users transforming their fitness."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignIn ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-gray-600 mt-1">
              {isSignIn ? "Enter your credentials to access your account" : "Fill in your details to get started"}
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading || signUpMutation.isPending || signInMutation.isPending}
            className="w-full mb-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            data-testid="google-signin-button"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-sm text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign In Form */}
          {isSignIn ? (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="identifier">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter username or email"
                    className="pl-10"
                    {...signInForm.register("identifier")}
                    data-testid="signin-identifier"
                  />
                </div>
                {signInForm.formState.errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{signInForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...signInForm.register("password")}
                    data-testid="signin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={signInMutation.isPending}
                data-testid="signin-submit"
              >
                {signInMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...signUpForm.register("firstName")}
                    data-testid="signup-firstname"
                  />
                  {signUpForm.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{signUpForm.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...signUpForm.register("lastName")}
                    data-testid="signup-lastname"
                  />
                  {signUpForm.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{signUpForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="pl-10"
                    {...signUpForm.register("username")}
                    data-testid="signup-username"
                  />
                </div>
                {signUpForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">{signUpForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signUpForm.register("email")}
                    data-testid="signup-email"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    {...signUpForm.register("password")}
                    data-testid="signup-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{signUpForm.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must contain at least 8 characters, one uppercase, one lowercase, and one number.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={signUpMutation.isPending}
                data-testid="signup-submit"
              >
                {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-red-600 hover:text-red-700 font-medium"
                data-testid="toggle-auth-mode"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-sm">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}