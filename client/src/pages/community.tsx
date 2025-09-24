import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Heart, Trophy, Dumbbell, Send, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CommunityPostWithUser } from "@shared/schema";

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<"message" | "workout_progress" | "goal_achievement">("message");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<CommunityPostWithUser[]>({
    queryKey: ["/api/community/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; postType: string; workoutId?: string }) => {
      const response = await apiRequest("POST", "/api/community/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPostContent("");
      setSelectedPostType("message");
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
    });
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
        return <Badge className="bg-primary/10 text-primary border-primary/20">Workout Update</Badge>;
      case "goal_achievement":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Goal Achieved</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your progress and connect with fellow fitness enthusiasts</p>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" />
              Share Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type
              </label>
              <Select value={selectedPostType} onValueChange={(value: "message" | "workout_progress" | "goal_achievement") => setSelectedPostType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">💬 General Message</SelectItem>
                  <SelectItem value="workout_progress">💪 Workout Progress</SelectItem>
                  <SelectItem value="goal_achievement">🎯 Goal Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <Textarea
                placeholder={
                  selectedPostType === "workout_progress" 
                    ? "Share details about your workout, how you felt, or what you accomplished..."
                    : selectedPostType === "goal_achievement"
                    ? "Tell the community about the goal you achieved and how it feels..."
                    : "Share your thoughts, ask questions, or motivate others..."
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitPost}
                disabled={!newPostContent.trim() || createPostMutation.isPending}
                className="px-6"
              >
                <Send className="mr-2" size={16} />
                {createPostMutation.isPending ? "Sharing..." : "Share Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {(post.user.firstName?.charAt(0) || post.user.email?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {post.user.firstName && post.user.lastName 
                                ? `${post.user.firstName} ${post.user.lastName}`
                                : post.user.email?.split('@')[0] || 'Anonymous User'}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{post.user.email}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(post.createdAt.toString())}</span>
                              {post.user.streak > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <Trophy size={14} className="text-yellow-500" />
                                    <span>{post.user.streak} day streak</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPostTypeBadge(post.postType)}
                          {getPostTypeIcon(post.postType)}
                        </div>
                      </div>
                      
                      <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {post.content}
                      </div>

                      {/* Workout info if it's a workout progress post */}
                      {post.workout && (
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{post.workout.name}</p>
                              <p className="text-sm text-gray-600 capitalize">{post.workout.category}</p>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{post.workout.duration} min</span>
                              </div>
                              <div>🔥 {post.workout.caloriesBurned} cal</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Heart 
                            className={`mr-1 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} 
                            size={16} 
                          />
                          {post.likes > 0 ? post.likes : ''}
                        </Button>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to share your fitness journey with the community!
                  </p>
                  <Button onClick={() => setNewPostContent("Great workout today! 💪")}>
                    Create First Post
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