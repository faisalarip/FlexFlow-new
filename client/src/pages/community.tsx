import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Heart, Trophy, Dumbbell, Send, Target, Clock, Sparkles, Zap, Users, TrendingUp, Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { CommunityPostWithUser } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<"message" | "workout_progress" | "goal_achievement">("message");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<CommunityPostWithUser[]>({
    queryKey: ["/api/community/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; postType: string; workoutId?: string; imageUrl?: string }) => {
      const response = await apiRequest("POST", "/api/community/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPostContent("");
      setSelectedPostType("message");
      setUploadedImageUrl(null);
      setImagePreview(null);
      toast({ title: "Post shared!", description: "Your post has been shared with the community." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to share post", variant: "destructive" });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    }
  });

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) return;
    
    createPostMutation.mutate({
      content: newPostContent.trim(),
      postType: selectedPostType,
      imageUrl: uploadedImageUrl || undefined,
    });
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      // Set ACL policy for the uploaded image
      try {
        const response = await apiRequest("PUT", "/api/community/post-images", {
          imageURL: uploadURL
        });
        const data = await response.json();
        
        setUploadedImageUrl(data.objectPath);
        setImagePreview(uploadURL);
        toast({ 
          title: "Image uploaded!", 
          description: "Your image is ready to share with your post." 
        });
      } catch (error) {
        console.error("Error setting image ACL:", error);
        toast({ 
          title: "Upload error", 
          description: "Image uploaded but failed to process. Try again.", 
          variant: "destructive" 
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setImagePreview(null);
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case "workout_progress":
        return <Dumbbell className="text-primary" size={16} />;
      case "goal_achievement":
        return <Target className="text-green-600" size={16} />;
      default:
        return <MessageSquare className="text-gray-600" size={16} />;
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case "workout_progress":
        return <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 border-red-300 animate-pulse">💪 Workout Beast</Badge>;
      case "goal_achievement":
        return <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-300 animate-bounce">🎯 Goal Crusher</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-blue-300">💭 Community Voice</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-red-900/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
        
        {/* Floating fitness icons */}
        <div className="absolute top-20 left-20 animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}>
          <Dumbbell className="w-6 h-6 text-purple-400/60" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
          <Trophy className="w-8 h-8 text-yellow-400/60" />
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>
          <Target className="w-7 h-7 text-green-400/60" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '0.5s'}}>
          <Zap className="w-6 h-6 text-orange-400/60" />
        </div>
        
        {/* Animated gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Join the fitness revolution! Share your victories, inspire others, and get motivated by amazing people like you 🚀
          </p>
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Share Progress</span>
            </div>
            <div className="flex items-center space-x-2 text-pink-600">
              <Heart className="w-5 h-5" />
              <span className="font-medium">Get Motivated</span>
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Level Up</span>
            </div>
          </div>
        </div>

        {/* Create Post */}
        <Card className="mb-12 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Share Your Journey
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Choose Your Vibe
              </label>
              <Select value={selectedPostType} onValueChange={(value: "message" | "workout_progress" | "goal_achievement") => setSelectedPostType(value)}>
                <SelectTrigger className="w-full h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message" className="cursor-pointer hover:bg-purple-50">
                    💬 <span className="font-medium">General Thoughts</span> - Share what's on your mind
                  </SelectItem>
                  <SelectItem value="workout_progress" className="cursor-pointer hover:bg-red-50">
                    💪 <span className="font-medium">Workout Beast Mode</span> - Show off your gains
                  </SelectItem>
                  <SelectItem value="goal_achievement" className="cursor-pointer hover:bg-green-50">
                    🎯 <span className="font-medium">Goal Crusher</span> - Celebrate your victories
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-pink-500" />
                Express Yourself
              </label>
              <Textarea
                placeholder={
                  selectedPostType === "workout_progress" 
                    ? "🔥 Just crushed an amazing workout! Tell us about those gains, how it felt, and what you conquered today..."
                    : selectedPostType === "goal_achievement"
                    ? "🎉 Goal achieved! Share your victory story - what did you accomplish and how does it feel to crush it?"
                    : "💭 What's motivating you today? Share your thoughts, ask questions, or drop some inspiration for the community..."
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full bg-gradient-to-br from-white to-purple-50/30 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200 text-lg text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <Image className="w-5 h-5 mr-2 text-orange-500" />
                Add a Picture (Optional)
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <img 
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-purple-200 shadow-lg"
                  />
                  <Button
                    onClick={handleRemoveImage}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              {/* Upload Button */}
              {!imagePreview && (
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Photo</span>
                  </div>
                </ObjectUploader>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitPost}
                disabled={!newPostContent.trim() || createPostMutation.isPending}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {createPostMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sharing Magic...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={18} />
                    Launch Post 🚀
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full w-40 animate-pulse"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-3 pl-16">
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full animate-pulse"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-pink-900/10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-102 border-purple-100 dark:border-purple-700/50 overflow-hidden relative group"
                style={{animationDelay: `${index * 100}ms`}}
              >
                {/* Animated gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-start space-x-4">
                    {/* Enhanced Avatar with status ring */}
                    <div className="relative">
                      <div className={`absolute -inset-1 rounded-full ${
                        post.user.streak > 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-400'
                      }`}></div>
                      <Avatar className="relative w-12 h-12 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                          {(post.user.firstName?.charAt(0) || post.user.email?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      {post.user.streak > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <span className="text-xs font-bold text-white">{post.user.streak}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                              {post.user.firstName && post.user.lastName 
                                ? `${post.user.firstName} ${post.user.lastName}`
                                : post.user.email?.split('@')[0] || 'Fitness Warrior'}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{post.user.email}</span>
                              <span className="text-purple-400">•</span>
                              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
                                {formatTimeAgo(post.createdAt.toString())}
                              </span>
                              {post.user.streak > 0 && (
                                <>
                                  <span className="text-yellow-400">•</span>
                                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 rounded-full">
                                    <Trophy size={12} className="text-white" />
                                    <span className="text-xs font-bold text-white">{post.user.streak} day streak!</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getPostTypeBadge(post.postType)}
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            {getPostTypeIcon(post.postType)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-lg leading-relaxed p-4 bg-gradient-to-br from-white/50 to-purple-50/50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                        {post.content}
                      </div>

                      {/* Display image if available */}
                      {post.imageUrl && (
                        <div className="mt-4">
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="w-full max-w-lg h-64 object-cover rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                            data-testid={`img-post-${post.id}`}
                          />
                        </div>
                      )}

                      {/* Enhanced workout info if it's a workout progress post */}
                      {post.workout && (
                        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700 shadow-inner">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <p className="text-xl font-bold text-red-700 dark:text-red-300 flex items-center">
                                <Dumbbell className="w-5 h-5 mr-2" />
                                {post.workout.name}
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 capitalize font-medium px-3 py-1 bg-red-100 dark:bg-red-800 rounded-full">
                                {post.workout.category}
                              </p>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="flex items-center justify-end space-x-2 text-orange-600 dark:text-orange-400">
                                <Clock size={16} />
                                <span className="text-lg font-bold">{post.workout.duration} min</span>
                              </div>
                              <div className="flex items-center justify-end space-x-2 text-yellow-600 dark:text-yellow-400">
                                <span className="text-2xl">🔥</span>
                                <span className="text-lg font-bold">{post.workout.caloriesBurned} cal</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-purple-100 dark:border-purple-800">
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleLike(post.id)}
                          className={`transition-all duration-300 transform hover:scale-110 ${
                            post.likes > 0 
                              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                              : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart 
                            className={`mr-2 transition-all duration-300 ${
                              post.likes > 0 
                                ? 'fill-red-500 text-red-500 animate-pulse' 
                                : 'hover:fill-red-200'
                            }`} 
                            size={20} 
                          />
                          <span className="font-bold text-lg">
                            {post.likes > 0 ? `${post.likes} ❤️` : 'Show Love'}
                          </span>
                        </Button>
                        
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                            <span className="text-sm font-bold text-purple-700">
                              {post.likes} {post.likes === 1 ? 'love' : 'loves'} ❤️
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-red-900/20 shadow-2xl border-purple-200 dark:border-purple-700">
              <CardContent className="pt-8">
                <div className="text-center py-16">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center shadow-xl animate-bounce">
                      <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
                    Ready to Ignite the Community? 🚀
                  </h3>
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Be the spark that starts the fire! Share your fitness journey and inspire others to reach their goals.
                  </p>
                  <Button 
                    onClick={() => setNewPostContent("Just started my fitness journey and feeling amazing! 💪🔥")}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="mr-3" size={20} />
                    Light Up the Feed! ✨
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}