import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, User, ArrowLeft, CheckCircle, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RecoveryStep = "request" | "reset" | "success";

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface ForgotUsernameForm {
  email: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState<RecoveryStep>("request");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("password");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const { toast } = useToast();

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    defaultValues: { email: "", token: "", newPassword: "", confirmPassword: "" },
  });

  const forgotUsernameForm = useForm<ForgotUsernameForm>({
    defaultValues: { email: "" },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      const submittedEmail = forgotPasswordForm.getValues("email");
      setEmail(submittedEmail);
      resetPasswordForm.setValue("email", submittedEmail);
      setStep("reset");
      toast({
        title: "Check Your Email",
        description: "If an account exists, we've sent a reset code to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      setStep("success");
      toast({
        title: "Password Reset!",
        description: "Your password has been reset successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Invalid or expired reset code",
        variant: "destructive",
      });
    },
  });

  const forgotUsernameMutation = useMutation({
    mutationFn: async (data: ForgotUsernameForm) => {
      const response = await apiRequest("POST", "/api/auth/forgot-username", data);
      return response.json();
    },
    onSuccess: () => {
      setUsernameSuccess(true);
      toast({
        title: "Check Your Email",
        description: "If an account exists, we've sent your username to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const handleForgotPassword = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data);
  };

  const handleResetPassword = (data: ResetPasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    if (data.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  const handleForgotUsername = (data: ForgotUsernameForm) => {
    forgotUsernameMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Dumbbell className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Recovery</h1>
          <p className="text-red-100">
            Forgot your password or username? We'll help you get back in.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password" data-testid="tab-password">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="username" data-testid="tab-username">
                <User className="w-4 h-4 mr-2" />
                Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              {step === "request" && (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Reset Your Password</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Enter your email address and we'll send you a reset code.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...forgotPasswordForm.register("email", { required: true })}
                        data-testid="input-forgot-email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={forgotPasswordMutation.isPending}
                    data-testid="btn-send-reset-code"
                  >
                    {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              )}

              {step === "reset" && (
                <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Enter Reset Code</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Check your email for the 6-digit reset code.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reset-token">Reset Code</Label>
                    <Input
                      id="reset-token"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      {...resetPasswordForm.register("token", { required: true })}
                      data-testid="input-reset-token"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-10"
                        {...resetPasswordForm.register("newPassword", { required: true })}
                        data-testid="input-new-password"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-10"
                        {...resetPasswordForm.register("confirmPassword", { required: true })}
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>

                  <Input
                    type="hidden"
                    {...resetPasswordForm.register("email")}
                    value={email}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="btn-reset-password"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("request")}
                    data-testid="btn-back-to-email"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Email Entry
                  </Button>
                </form>
              )}

              {step === "success" && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
                  <p className="text-gray-600">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700" data-testid="btn-go-signin">
                    <Link href="/auth?mode=signin">Go to Sign In</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="username">
              {!usernameSuccess ? (
                <form onSubmit={forgotUsernameForm.handleSubmit(handleForgotUsername)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recover Your Username</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Enter your email and we'll send you your username.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="username-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="username-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...forgotUsernameForm.register("email", { required: true })}
                        data-testid="input-username-email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={forgotUsernameMutation.isPending}
                    data-testid="btn-send-username"
                  >
                    {forgotUsernameMutation.isPending ? "Sending..." : "Send Username"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Check Your Email!</h2>
                  <p className="text-gray-600">
                    If an account exists with that email, we've sent your username to it.
                  </p>
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700" data-testid="btn-back-signin">
                    <Link href="/auth?mode=signin">Back to Sign In</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6 pt-6 border-t">
            <Link href="/auth?mode=signin" className="text-red-600 hover:text-red-700 font-medium" data-testid="link-back-signin">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
