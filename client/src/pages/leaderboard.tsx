import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Users, Crown, Star, Sparkles } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number, size: number = 24) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Crown className="text-yellow-400 drop-shadow-lg animate-bounce" size={size} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <Trophy className="text-gray-400 drop-shadow-md" size={size} />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gray-300 animate-pulse" />
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <Medal className="text-amber-600 drop-shadow-md" size={size} />
            <Star className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
          </div>
        );
      default:
        return <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
          {rank}
        </div>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 border-yellow-400 shadow-yellow-200/50";
      case 2:
        return "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border-gray-400 shadow-gray-200/50";
      case 3:
        return "bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 border-amber-400 shadow-amber-200/50";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return "h-48"; // Tallest for gold
      case 2:
        return "h-36"; // Medium for silver  
      case 3:
        return "h-32"; // Shortest for bronze
      default:
        return "h-24";
    }
  };

  const getPodiumOrder = (rank: number) => {
    // Arrange podium: 2nd, 1st, 3rd (classic podium layout)
    switch (rank) {
      case 1:
        return "order-2"; // Center position
      case 2:
        return "order-1"; // Left position
      case 3:
        return "order-3"; // Right position
      default:
        return "order-4";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other users</p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other users</p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workout data yet</h3>
                <p className="text-gray-600">
                  Complete some workouts with exercises and reps to appear on the leaderboard!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/20 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-16 w-12 h-12 bg-purple-300/20 rounded-full animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-300/20 rounded-full animate-ping"></div>
      <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-yellow-400/30 rounded-full animate-pulse"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent mb-4 animate-pulse">
            🏅 WEEKLY FITNESS LEADERBOARD 🏅
          </h1>
          <p className="text-lg text-gray-700 font-medium">Weekly champions ranked by reps completed • Resets every Monday!</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Trophy className="mx-auto mb-2 text-yellow-500 animate-bounce" size={40} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-900 bg-clip-text text-transparent">
                  {topThree[0]?.totalReps.toLocaleString() || 0}
                </p>
                <p className="text-sm font-semibold text-yellow-800">🏆 Champion Score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Users className="mx-auto mb-2 text-blue-500 animate-pulse" size={40} />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-blue-300 animate-spin" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">{leaderboard.length}</p>
                <p className="text-sm font-semibold text-blue-800">💪 Active Warriors</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Award className="mx-auto mb-2 text-green-500 animate-pulse" size={40} />
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-green-300 animate-bounce" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                  {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0) / leaderboard.length).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-green-800">⚖️ Average Reps</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Champions Podium */}
        {topThree.length > 0 && (
          <div className="mb-12 relative">
            {/* Celebration Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 rounded-3xl opacity-50"></div>
            <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            
            <Card className="relative z-10 border-2 border-gradient-to-r from-yellow-200 to-pink-200 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
                  <Crown className="mr-3 text-yellow-500 animate-pulse" size={36} />
                  🏆 Champions Podium 🏆
                  <Crown className="ml-3 text-yellow-500 animate-pulse" size={36} />
                </CardTitle>
                <p className="text-gray-600 mt-2">Our fitness legends of the week!</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {/* Podium Container */}
                <div className="flex items-end justify-center space-x-4 md:space-x-8">
                  {topThree.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`${getPodiumOrder(entry.rank)} flex flex-col items-center transform transition-all duration-500 hover:scale-105`}
                      data-testid={`podium-place-${entry.rank}`}
                    >
                      {/* Winner Avatar & Crown */}
                      <div className="relative mb-4">
                        <div className={`w-20 h-20 rounded-full border-4 ${entry.rank === 1 ? 'border-yellow-400 shadow-yellow-300/50' : entry.rank === 2 ? 'border-gray-400 shadow-gray-300/50' : 'border-amber-400 shadow-amber-300/50'} shadow-xl flex items-center justify-center bg-gradient-to-br ${entry.rank === 1 ? 'from-yellow-100 to-yellow-200' : entry.rank === 2 ? 'from-gray-100 to-gray-200' : 'from-amber-100 to-amber-200'}`}>
                          <span className="text-2xl font-bold bg-gradient-to-r ${entry.rank === 1 ? 'from-yellow-700 to-yellow-900' : entry.rank === 2 ? 'from-gray-700 to-gray-900' : 'from-amber-700 to-amber-900'} bg-clip-text text-transparent">
                            {entry.firstName?.charAt(0) || entry.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        {/* Floating Crown/Icon */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          {getRankIcon(entry.rank, entry.rank === 1 ? 32 : 28)}
                        </div>
                        {/* Sparkle Effects */}
                        {entry.rank === 1 && (
                          <>
                            <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                          </>
                        )}
                      </div>
                      
                      {/* Winner Info */}
                      <div className="text-center mb-4 px-2">
                        <h3 className={`font-bold text-lg ${entry.rank === 1 ? 'text-yellow-800' : entry.rank === 2 ? 'text-gray-800' : 'text-amber-800'} mb-1`}>
                          {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                        </h3>
                        <p className="text-sm text-gray-600">@{entry.email?.split('@')[0] || 'user'}</p>
                        <div className="mt-2">
                          <p className={`text-2xl font-bold ${entry.rank === 1 ? 'text-yellow-700' : entry.rank === 2 ? 'text-gray-700' : 'text-amber-700'}`}>
                            {entry.totalReps.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">total reps</p>
                        </div>
                      </div>
                      
                      {/* Podium Platform */}
                      <div className={`w-24 ${getPodiumHeight(entry.rank)} ${getRankBgColor(entry.rank)} border-2 rounded-t-lg shadow-xl relative overflow-hidden`}>
                        {/* Podium Rank Number */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-4xl font-black ${entry.rank === 1 ? 'text-yellow-800' : entry.rank === 2 ? 'text-gray-800' : 'text-amber-800'} opacity-30`}>
                            {entry.rank}
                          </span>
                        </div>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        {/* Base Platform */}
                        <div className={`absolute bottom-0 w-full h-2 ${entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-500' : 'bg-amber-500'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Celebration Message */}
                <div className="text-center mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <p className="text-lg font-medium text-gray-800 mb-2">🎉 Congratulations Champions! 🎉</p>
                  <p className="text-sm text-gray-600">Amazing dedication to fitness excellence!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                      </h4>
                      <p className="text-sm text-gray-600">@{entry.email?.split('@')[0] || 'user'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {entry.totalReps.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">reps</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Want to climb the ranks?</h3>
              <p className="text-gray-600 mb-4">
                Log more workouts with exercises that include rep counts to increase your total and move up the leaderboard!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span>• Track strength training workouts</span>
                <span>• Log bodyweight exercises</span>
                <span>• Include rep counts in your exercises</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}