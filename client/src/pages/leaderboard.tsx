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
            <Crown className="text-red-500 drop-shadow-lg animate-pulse" size={size} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <Trophy className="text-red-400 drop-shadow-md" size={size} />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-red-300 animate-pulse" />
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <Medal className="text-red-300 drop-shadow-md" size={size} />
            <Star className="absolute -top-1 -right-1 w-3 h-3 text-red-200 animate-pulse" />
          </div>
        );
      default:
        return <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-white border border-red-800">
          {rank}
        </div>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-red-950 via-red-900 to-black border-red-500 shadow-red-500/30";
      case 2:
        return "bg-gradient-to-br from-red-900 via-red-800 to-gray-900 border-red-400 shadow-red-400/20";
      case 3:
        return "bg-gradient-to-br from-red-800 via-red-700 to-gray-800 border-red-300 shadow-red-300/20";
      default:
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-red-900";
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
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Elite Leaderboard</h1>
            <p className="text-red-400">Champions ranked by total reps this week</p>
          </div>
          
          <Card className="bg-gray-900 border-red-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-800 rounded-lg"></div>
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
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Elite Leaderboard</h1>
            <p className="text-red-400">Champions ranked by total reps this week</p>
          </div>
          
          <Card className="bg-gray-900 border-red-800">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="mx-auto mb-4 text-red-400" size={48} />
                <h3 className="text-lg font-medium text-white mb-2">Start Your Journey</h3>
                <p className="text-gray-400">
                  Complete workouts with exercises and reps to earn your place among the elite!
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-red-900/10 animate-pulse"></div>
      
      {/* Dynamic Diagonal Stripes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
        <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-transparent to-red-600" style={{animationDelay: '0.2s'}}></div>
        <div className="absolute bottom-40 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Floating Particles & Stars */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-red-500/20 rounded-full animate-pulse blur-xl"></div>
      <div className="absolute top-32 right-16 w-32 h-32 bg-red-600/10 rounded-full animate-bounce blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-red-400/15 rounded-full animate-ping blur-xl"></div>
      <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-red-500/20 rounded-full animate-pulse blur-lg"></div>
      
      {/* Animated Stars */}
      <div className="absolute top-24 left-1/3 text-red-500 opacity-30 animate-spin" style={{animationDuration: '3s'}}>⭐</div>
      <div className="absolute top-48 right-1/4 text-red-400 opacity-40 animate-bounce" style={{animationDelay: '0.5s'}}>💪</div>
      <div className="absolute bottom-32 left-1/5 text-red-600 opacity-30 animate-pulse" style={{animationDelay: '1s'}}>🏆</div>
      <div className="absolute bottom-56 right-1/5 text-red-500 opacity-25 animate-spin" style={{animationDuration: '4s'}}>🔥</div>
      
      {/* Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Moving Light Beams */}
      <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-red-600/15 via-transparent to-red-600/15 animate-pulse" style={{animationDelay: '0.7s'}}></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent mb-4">
            🏆 ELITE LEADERBOARD 🏆
          </h1>
          <p className="text-lg text-red-400 font-medium">Champions ranked by total reps • Elite performance tracker</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-950 to-black border-red-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Trophy className="mx-auto mb-2 text-red-500 animate-bounce" size={40} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <p className="text-3xl font-bold text-red-400">
                  {topThree[0]?.totalReps.toLocaleString() || 0}
                </p>
                <p className="text-sm font-semibold text-red-300">🏆 Champion Score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900 to-black border-red-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Users className="mx-auto mb-2 text-red-400 animate-pulse" size={40} />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-red-300 animate-spin" />
                </div>
                <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
                <p className="text-sm font-semibold text-red-300">💪 Elite Athletes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-900 to-black border-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Award className="mx-auto mb-2 text-red-400 animate-pulse" size={40} />
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-red-300 animate-bounce" />
                </div>
                <p className="text-3xl font-bold text-red-300">
                  {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0) / leaderboard.length).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-red-400">⚖️ Average Reps</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Champions Podium */}
        {topThree.length > 0 && (
          <div className="mb-12 relative">
            {/* Celebration Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-gray-900 rounded-3xl opacity-70"></div>
            <div className="absolute top-4 left-8 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-red-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-red-300 rounded-full animate-pulse"></div>
            
            <Card className="relative z-10 border-2 border-red-500 shadow-2xl bg-gray-900">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                  <Crown className="mr-3 text-red-500 animate-pulse" size={36} />
                  🏆 Elite Podium 🏆
                  <Crown className="ml-3 text-red-500 animate-pulse" size={36} />
                </CardTitle>
                <p className="text-red-400 mt-2">Our elite fitness champions!</p>
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
                        <div className={`w-20 h-20 rounded-full border-4 ${entry.rank === 1 ? 'border-red-500 shadow-red-500/50' : entry.rank === 2 ? 'border-red-400 shadow-red-400/50' : 'border-red-300 shadow-red-300/50'} shadow-xl flex items-center justify-center bg-gradient-to-br ${entry.rank === 1 ? 'from-red-950 to-black' : entry.rank === 2 ? 'from-red-900 to-gray-900' : 'from-red-800 to-gray-800'}`}>
                          <span className={`text-2xl font-bold ${entry.rank === 1 ? 'text-red-300' : entry.rank === 2 ? 'text-red-400' : 'text-red-500'}`}>
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
                            <div className="absolute -top-2 -left-2 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                          </>
                        )}
                      </div>
                      
                      {/* Winner Info */}
                      <div className="text-center mb-4 px-2">
                        <h3 className={`font-bold text-lg ${entry.rank === 1 ? 'text-white' : entry.rank === 2 ? 'text-red-200' : 'text-red-300'} mb-1`}>
                          {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                        </h3>
                        <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                        <div className="mt-2">
                          <p className={`text-2xl font-bold ${entry.rank === 1 ? 'text-red-400' : entry.rank === 2 ? 'text-red-500' : 'text-red-600'}`}>
                            {entry.totalReps.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">total reps</p>
                        </div>
                      </div>
                      
                      {/* Podium Platform */}
                      <div className={`w-24 ${getPodiumHeight(entry.rank)} ${getRankBgColor(entry.rank)} border-2 rounded-t-lg shadow-xl relative overflow-hidden`}>
                        {/* Podium Rank Number */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-4xl font-black ${entry.rank === 1 ? 'text-red-600' : entry.rank === 2 ? 'text-red-700' : 'text-red-800'} opacity-40`}>
                            {entry.rank}
                          </span>
                        </div>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse"></div>
                        {/* Base Platform */}
                        <div className={`absolute bottom-0 w-full h-2 ${entry.rank === 1 ? 'bg-red-500' : entry.rank === 2 ? 'bg-red-400' : 'bg-red-300'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Celebration Message */}
                <div className="text-center mt-8 p-4 bg-gradient-to-r from-red-950 to-gray-900 rounded-xl border border-red-500">
                  <p className="text-lg font-medium text-white mb-2">🎆 Elite Performance! 🎆</p>
                  <p className="text-sm text-red-400">Unmatched dedication to excellence!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="bg-gray-900 border-red-800">
          <CardHeader>
            <CardTitle className="text-white">Elite Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)} transition-all hover:shadow-md`}
                  data-testid={`leaderboard-entry-${entry.rank}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                      </h4>
                      <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">
                      {entry.totalReps.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">reps</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8 bg-gray-900 border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Claim Your Elite Status</h3>
              <p className="text-red-400 mb-4">
                Log workouts with high rep counts to dominate the leaderboard and join the elite!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span>• High-intensity workouts</span>
                <span>• Maximum rep counts</span>
                <span>• Consistent training</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}