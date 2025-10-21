import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, CreditCard, Calendar, Crown, Check, X, Trash2, AlertTriangle, Bell, Award, Trophy, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNewAuth } from "@/hooks/useNewAuth";
import ProfileEditor from "@/components/profile-editor";
import type { User } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NotificationPreferences {
  id: string;
  userId: string;
  workoutRemindersEnabled: boolean;
  mealNotificationsEnabled: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  notificationPermissionGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserBadgeWithDetails {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: {
    id: string;
    name: string;
    description: string;
    iconName: string;
    category: string;
    requiredDays: number | null;
    createdAt: Date;
  };
}

export default function SettingsPage() {
  const { user } = useNewAuth() as { user: User | null };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch notification preferences
  const { data: notificationPreferences, isLoading: isLoadingPreferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: !!user,
  });

  // Fetch user badges
  const { data: userBadges, isLoading: isLoadingBadges } = useQuery<UserBadgeWithDetails[]>({
    queryKey: ["/api/user/badges"],
    enabled: !!user,
  });

  // Update notification preferences mutation
  const updateNotificationPreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const response = await apiRequest("PUT", "/api/notification-preferences", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      // Redirect to landing page after a brief delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Active</Badge>;
      case "free_trial":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Crown className="w-3 h-3 mr-1" />Free Trial</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Expired</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionDescription = (status: string) => {
    switch (status) {
      case "active":
        return "You have full access to all premium features including advanced analytics, unlimited workout logging, and priority support.";
      case "free_trial":
        return "You're currently enjoying your free trial with access to all premium features. Upgrade to continue after your trial ends.";
      case "expired":
        return "Your subscription has expired. Upgrade to regain access to premium features and continue your fitness journey.";
      case "inactive":
        return "Your subscription is currently inactive. Reactivate to access premium features.";
      default:
        return "Manage your subscription to access premium features.";
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const iconProps = { className: "w-12 h-12" };
    switch (iconName.toLowerCase()) {
      case "flame":
        return <Flame {...iconProps} className="w-12 h-12 text-orange-500" />;
      case "zap":
        return <Zap {...iconProps} className="w-12 h-12 text-yellow-500" />;
      case "trophy":
        return <Trophy {...iconProps} className="w-12 h-12 text-amber-500" />;
      case "award":
        return <Award {...iconProps} className="w-12 h-12 text-blue-500" />;
      default:
        return <Award {...iconProps} className="w-12 h-12 text-purple-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="settings-title">Settings</h1>
          <p className="text-gray-600">Manage your account and subscription preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <Card data-testid="profile-settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Personal Information</h3>
              <p className="text-sm text-gray-600">
                Name: {user?.firstName || user?.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : "Not set"}
              </p>
              <p className="text-sm text-gray-600">Email: {user?.email || "Not available"}</p>
            </div>
            <ProfileEditor trigger={
              <Button variant="outline" data-testid="edit-profile-settings">
                Edit Profile
              </Button>
            } />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Section */}
      <Card data-testid="notification-settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage workout reminders and meal time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingPreferences ? (
            <p className="text-sm text-gray-500">Loading preferences...</p>
          ) : (
            <>
              {/* Workout Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="workout-reminders" className="text-base">
                    Workout Reminders
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified if you haven't logged a workout in 24 hours
                  </p>
                </div>
                <Switch
                  id="workout-reminders"
                  checked={notificationPreferences?.workoutRemindersEnabled ?? true}
                  onCheckedChange={(checked) => {
                    updateNotificationPreferences.mutate({ workoutRemindersEnabled: checked });
                  }}
                  data-testid="switch-workout-reminders"
                />
              </div>

              <Separator />

              {/* Meal Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="meal-notifications" className="text-base">
                      Meal Time Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive reminders for breakfast, lunch, and dinner times
                    </p>
                  </div>
                  <Switch
                    id="meal-notifications"
                    checked={notificationPreferences?.mealNotificationsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      updateNotificationPreferences.mutate({ mealNotificationsEnabled: checked });
                    }}
                    data-testid="switch-meal-notifications"
                  />
                </div>

                {notificationPreferences?.mealNotificationsEnabled && (
                  <div className="ml-4 space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="breakfast-time">Breakfast Time</Label>
                        <Input
                          id="breakfast-time"
                          type="time"
                          value={notificationPreferences?.breakfastTime || "08:00"}
                          onChange={(e) => {
                            updateNotificationPreferences.mutate({ breakfastTime: e.target.value });
                          }}
                          data-testid="input-breakfast-time"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lunch-time">Lunch Time</Label>
                        <Input
                          id="lunch-time"
                          type="time"
                          value={notificationPreferences?.lunchTime || "12:00"}
                          onChange={(e) => {
                            updateNotificationPreferences.mutate({ lunchTime: e.target.value });
                          }}
                          data-testid="input-lunch-time"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dinner-time">Dinner Time</Label>
                        <Input
                          id="dinner-time"
                          type="time"
                          value={notificationPreferences?.dinnerTime || "18:00"}
                          onChange={(e) => {
                            updateNotificationPreferences.mutate({ dinnerTime: e.target.value });
                          }}
                          data-testid="input-dinner-time"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Browser Notification Permission */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Browser Notifications</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {notificationPreferences?.notificationPermissionGranted
                        ? "Browser notifications are enabled. You'll receive reminders even when the app is closed."
                        : "Enable browser notifications to receive reminders even when the app is not open."}
                    </p>
                    {!notificationPreferences?.notificationPermissionGranted && (
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if ('Notification' in window) {
                            const permission = await Notification.requestPermission();
                            if (permission === 'granted') {
                              updateNotificationPreferences.mutate({ notificationPermissionGranted: true });
                              toast({
                                title: "Notifications Enabled",
                                description: "You'll now receive browser notifications for reminders.",
                              });
                            }
                          } else {
                            toast({
                              title: "Not Supported",
                              description: "Your browser doesn't support notifications.",
                              variant: "destructive",
                            });
                          }
                        }}
                        data-testid="button-enable-notifications"
                      >
                        Enable Browser Notifications
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card data-testid="badges-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements & Badges
          </CardTitle>
          <CardDescription>
            Earn badges for consistency and dedication to your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBadges ? (
            <p className="text-sm text-gray-500">Loading your achievements...</p>
          ) : (
            <div className="space-y-6">
              {userBadges && userBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBadges.map((userBadge) => (
                    <div
                      key={userBadge.id}
                      className="flex items-start gap-4 p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                      data-testid={`badge-${userBadge.badge.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex-shrink-0">
                        {getBadgeIcon(userBadge.badge.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {userBadge.badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {userBadge.badge.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Earned on {new Date(userBadge.earnedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">No badges earned yet</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Keep logging your workouts daily to earn consistency badges!
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Week Warrior - 7 days streak</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Fortnight Champion - 14 days streak</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>Monthly Master - 30 days streak</span>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Current Streak Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Current Streak: {user?.streak || 0} days</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {user?.streak && user.streak >= 7
                        ? "Great job! Keep up the consistent work to maintain your badges."
                        : `Keep logging workouts daily! ${7 - (user?.streak || 0)} more days until your first badge.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card data-testid="subscription-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Subscription Details
          </CardTitle>
          <CardDescription>
            View and manage your FlexFlow subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                Current Plan
                {getStatusBadge(user?.subscriptionStatus || "inactive")}
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                {getSubscriptionDescription(user?.subscriptionStatus || "inactive")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Subscription Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{user?.subscriptionStatus || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">{formatDate(user?.subscriptionStartDate || null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {user?.subscriptionStatus === "free_trial" ? "Trial Ends:" : "Next Billing:"}
                  </span>
                  <span className="font-medium">{formatDate(user?.subscriptionExpiresAt || null)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">{formatDate(user?.createdAt || null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(user?.updatedAt || null)}</span>
                </div>
                {user?.lastPaymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Payment:</span>
                    <span className="font-medium">{formatDate(user.lastPaymentDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.subscriptionStatus === "free_trial" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Free Trial Active</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    You're currently enjoying full access to all premium features. 
                    Your trial expires on {formatDate(user?.subscriptionExpiresAt)}. 
                    Upgrade now to continue your fitness journey without interruption.
                  </p>
                  <Button 
                    className="mt-3" 
                    size="sm"
                    onClick={() => window.location.href = '#subscription'}
                    data-testid="upgrade-trial-button"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {user?.subscriptionStatus === "expired" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Subscription Expired</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Your subscription expired on {formatDate(user?.subscriptionExpiresAt)}. 
                    Renew your subscription to regain access to premium features and continue tracking your progress.
                  </p>
                  <Button 
                    className="mt-3" 
                    size="sm"
                    onClick={() => window.location.href = '#subscription'}
                    data-testid="renew-subscription-button"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Renew Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}

          {user?.subscriptionStatus === "active" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Premium Active</h4>
                  <p className="text-sm text-green-800 mt-1">
                    You have full access to all premium features. Your subscription will renew on {formatDate(user?.subscriptionExpiresAt)}.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '#subscription'}
                      data-testid="manage-subscription-button"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card data-testid="features-card">
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
          <CardDescription>
            See what's included with your FlexFlow subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Unlimited workout logging</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Advanced progress analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Personal trainer connections</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">AI-powered workout recommendations</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Custom goal setting & tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Detailed nutrition insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Export workout data</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority customer support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-red-200" data-testid="account-deletion-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Warning: This action cannot be undone</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1 ml-4 list-disc">
                    <li>All your workout history and progress photos</li>
                    <li>All your goals, meal plans, and food tracking data</li>
                    <li>Your community posts and trainer reviews</li>
                    <li>Your subscription and payment information</li>
                    <li>Your personal profile and preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  data-testid="delete-account-button"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all of your data from our servers, including:
                    <ul className="mt-2 space-y-1 ml-4 list-disc">
                      <li>All workout history and exercise logs</li>
                      <li>Progress photos and measurements</li>
                      <li>Meal plans and nutrition tracking data</li>
                      <li>Goals and achievements</li>
                      <li>Community posts and interactions</li>
                      <li>Subscription and billing information</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="cancel-delete-button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAccountMutation.mutate()}
                    disabled={deleteAccountMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="confirm-delete-button"
                  >
                    {deleteAccountMutation.isPending ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}