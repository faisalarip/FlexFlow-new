import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Heart, Trophy, Dumbbell, Send, Target, Clock, Sparkles, Zap, Users, TrendingUp, Image, Upload, ThumbsDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useNewAuth } from "@/hooks/useNewAuth";
import type { CommunityPostWithUser } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<"message" | "workout_progress" | "goal_achievement">("message");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useNewAuth();

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

  const dislikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/community/posts/${postId}/dislike`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to dislike post", variant: "destructive" });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("DELETE", `/api/community/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post deleted", description: "Your post has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete post", 
        variant: "destructive" 
      });
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
        
        setUploadedImageUrl(data.objectPath || null);
        setImagePreview(uploadURL || null);
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

  const handleDislike = (postId: string) => {
    dislikeMutation.mutate(postId);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePostMutation.mutate(postId);
    }
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
      {/* Simplified background for mobile, full effects on desktop */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl hidden md:block animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl hidden md:block animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Mobile-friendly gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 md:hidden"></div>
        
        {/* Animated gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* Mobile-native header */}
        <div className="mb-6 md:mb-12">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shrink-0">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-[32px] md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent tracking-tight leading-none">
              Community Hub
            </h1>
          </div>
          <p className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-4 md:mb-6 leading-snug">
            Share your victories, inspire others, and get motivated 🚀
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </div>
            <div className="flex items-center gap-1.5 text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-full">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Motivate</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Level Up</span>
            </div>
          </div>
        </div>

        {/* Create Post */}
        <Card className="mb-6 md:mb-12 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-700 shadow-lg md:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 p-4 md:p-6">
            <CardTitle className="flex items-center text-lg md:text-2xl">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 md:mr-3 shrink-0">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Share Your Journey
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div>
              <label className="block text-sm md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-500" />
                Choose Your Vibe
              </label>
              <Select value={selectedPostType} onValueChange={(value: "message" | "workout_progress" | "goal_achievement") => setSelectedPostType(value)}>
                <SelectTrigger className="w-full min-h-[44px] bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 transition-colors text-base" data-testid="select-post-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message" className="cursor-pointer hover:bg-purple-50 min-h-[44px] text-base">
                    💬 <span className="font-medium">General Thoughts</span>
                  </SelectItem>
                  <SelectItem value="workout_progress" className="cursor-pointer hover:bg-red-50 min-h-[44px] text-base">
                    💪 <span className="font-medium">Workout Beast Mode</span>
                  </SelectItem>
                  <SelectItem value="goal_achievement" className="cursor-pointer hover:bg-green-50 min-h-[44px] text-base">
                    🎯 <span className="font-medium">Goal Crusher</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-pink-500" />
                Express Yourself
              </label>
              <Textarea
                placeholder={
                  selectedPostType === "workout_progress" 
                    ? "🔥 Just crushed an amazing workout! Tell us about it..."
                    : selectedPostType === "goal_achievement"
                    ? "🎉 Goal achieved! Share your victory story..."
                    : "💭 What's motivating you today?"
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200 text-base text-white min-h-[100px]"
                data-testid="textarea-post-content"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                <Image className="w-4 h-4 mr-2 text-orange-500" />
                Add a Picture (Optional)
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative">
                  <img 
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-sm h-32 object-cover rounded-lg border-2 border-purple-200 shadow-lg"
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
                className="w-full md:w-auto min-h-[44px] px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold text-base rounded-full shadow-lg active:scale-95 transition-all duration-200"
                data-testid="button-submit-post"
              >
                {createPostMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sharing...
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
        <div className="space-y-4 md:space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full"></div>
                      <div className="space-y-3 flex-1">
                        <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full w-40"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-pink-900/10 shadow-md active:shadow-lg transition-all duration-200 border-purple-100 dark:border-purple-700/50 overflow-hidden"
                data-testid={`card-post-${post.id}`}
              >
                <CardContent className="p-4 md:p-3">
                  <div className="flex items-start gap-3 md:gap-2">
                    {/* Enhanced Avatar with status ring */}
                    <div className="relative shrink-0">
                      <div className={`absolute -inset-1 rounded-full ${
                        post.user.streak > 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-400'
                      }`}></div>
                      <Avatar className="relative w-10 h-10 md:w-8 md:h-8 border-2 border-white shadow-sm">
                        {post.user.profileImageUrl && (
                          <AvatarImage 
                            src={post.user.profileImageUrl} 
                            alt={`${post.user.firstName || 'User'}'s profile`}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-base md:text-sm font-bold">
                          {(post.user.firstName?.charAt(0) || post.user.email?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      {post.user.streak > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-4 md:h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm border border-white">
                          <span className="text-xs md:text-[10px] font-bold text-white">{post.user.streak}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2 md:space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm md:text-xs font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent truncate">
                              {post.user.firstName && post.user.lastName 
                                ? `${post.user.firstName} ${post.user.lastName}`
                                : 'Fitness Warrior'}
                            </p>
                            {post.user.streak > 0 && (
                              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 rounded-full shrink-0">
                                <Trophy size={12} className="text-white" />
                                <span className="text-xs font-bold text-white">{post.user.streak}🔥</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs md:text-[10px] text-gray-600 dark:text-gray-400">
                            {formatTimeAgo(post.createdAt.toString())}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="hidden md:block">{getPostTypeBadge(post.postType)}</div>
                          {/* Delete button - only show for user's own posts */}
                          {currentUser && post.userId === currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="min-h-[44px] min-w-[44px] md:h-7 md:w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 active:scale-95 rounded-full transition-all"
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 size={16} className="md:w-3 md:h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed md:leading-snug p-3 md:p-2 bg-gradient-to-br from-white/50 to-purple-50/50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-lg md:rounded-md border border-purple-100 dark:border-purple-800 text-[15px] md:text-xs">
                        {post.content}
                      </div>

                      {/* Display image if available */}
                      {post.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="w-full max-w-xs h-48 md:max-w-32 md:h-20 object-cover rounded-lg md:rounded border-2 md:border border-purple-200 dark:border-purple-700 shadow-md"
                            data-testid={`img-post-${post.id}`}
                          />
                        </div>
                      )}

                      {/* Enhanced workout info if it's a workout progress post */}
                      {post.workout && (
                        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded p-2 border border-red-200 dark:border-red-700 shadow-inner">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-bold text-red-700 dark:text-red-300 flex items-center" style={{fontSize: '11px'}}>
                                <Dumbbell className="w-3 h-3 mr-1" />
                                {post.workout.name}
                              </p>
                              <p className="text-red-600 dark:text-red-400 capitalize font-medium px-1.5 py-0.5 bg-red-100 dark:bg-red-800 rounded-full" style={{fontSize: '10px'}}>
                                {post.workout.category}
                              </p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <div className="flex items-center justify-end space-x-0.5 text-orange-600 dark:text-orange-400">
                                <Clock size={10} />
                                <span className="font-bold" style={{fontSize: '10px'}}>{post.workout.duration}min</span>
                              </div>
                              <div className="flex items-center justify-end space-x-0.5 text-yellow-600 dark:text-yellow-400">
                                <span style={{fontSize: '10px'}}>🔥</span>
                                <span className="font-bold" style={{fontSize: '10px'}}>{post.workout.caloriesBurned}cal</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 md:pt-1 border-t border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          {/* Like Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            disabled={likeMutation.isPending}
                            className="h-11 md:h-7 px-3 md:px-2 text-sm md:text-xs text-gray-600 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                            data-testid={`button-like-post-${post.id}`}
                          >
                            <Heart 
                              className="mr-1.5 md:mr-1" 
                              size={16} 
                            />
                            <span className="font-bold">
                              Like
                            </span>
                          </Button>
                          
                          {/* Dislike Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDislike(post.id)}
                            disabled={dislikeMutation.isPending}
                            className="h-11 md:h-7 px-3 md:px-2 text-sm md:text-xs text-gray-600 hover:text-blue-500 hover:bg-blue-50 active:scale-95 transition-all"
                            data-testid={`button-dislike-post-${post.id}`}
                          >
                            <ThumbsDown 
                              className="mr-1.5 md:mr-1" 
                              size={16} 
                            />
                            <span className="font-bold">
                              Dislike
                            </span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Likes Count */}
                          <div className="bg-gradient-to-r from-red-100 to-pink-100 px-2.5 md:px-2 py-1 md:py-0.5 rounded-full">
                            <span className="text-sm md:text-xs font-bold text-red-700" data-testid={`text-likes-${post.id}`}>
                              {post.likes} ❤️
                            </span>
                          </div>
                          {/* Dislikes Count */}
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-2.5 md:px-2 py-1 md:py-0.5 rounded-full">
                            <span className="text-sm md:text-xs font-bold text-blue-700" data-testid={`text-dislikes-${post.id}`}>
                              {post.dislikes || 0} 👎
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
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-red-900/20 shadow-lg border-purple-200 dark:border-purple-700">
              <CardContent className="p-6 md:p-8">
                <div className="text-center py-8 md:py-16">
                  <div className="relative mb-6 md:mb-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center shadow-xl">
                      <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3 md:mb-4">
                    Ready to Ignite the Community? 🚀
                  </h3>
                  <p className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
                    Be the spark that starts the fire! Share your fitness journey and inspire others.
                  </p>
                  <Button 
                    onClick={() => setNewPostContent("Just started my fitness journey and feeling amazing! 💪🔥")}
                    className="w-full md:w-auto min-h-[44px] px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold text-base md:text-xl rounded-full shadow-lg active:scale-95 transition-all duration-200"
                    data-testid="button-start-first-post"
                  >
                    <Sparkles className="mr-2 md:mr-3" size={20} />
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