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
      // Include personal plan data if available
      const personalPlanData = localStorage.getItem('pendingPersonalPlan');
      const signUpPayload = {
        ...userData,
        personalPlanData: personalPlanData ? JSON.parse(personalPlanData) : null
      };
      
      const response = await apiRequest("POST", "/api/auth/signup", signUpPayload);
      return response.json();
    },
    onSuccess: (data) => {
      // Clear the pending plan data after successful signup
      localStorage.removeItem('pendingPersonalPlan');
      
      toast({
        title: "🎉 Welcome to FlexFlow!",
        description: "Your account has been created successfully.",
      });
      signIn(data.user, data.token);
      
      // Redirect new users to tutorial page
      setTimeout(() => setLocation('/tutorial'), 100);
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