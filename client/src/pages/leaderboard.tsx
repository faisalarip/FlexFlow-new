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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 relative overflow-hidden">
      {/* Animated Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-blue-500/30 to-cyan-500/40 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-pink-500/20 via-transparent to-blue-600/30" style={{animation: 'pulse 4s ease-in-out infinite alternate'}}></div>
      
      {/* Animated Wave Lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-500 animate-pulse"></div>
        <div className="absolute top-24 left-0 w-full h-6 bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-400 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-48 left-0 w-full h-4 bg-gradient-to-r from-pink-500 via-purple-400 to-blue-500 animate-pulse" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute bottom-48 left-0 w-full h-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute bottom-24 left-0 w-full h-7 bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 animate-pulse" style={{animationDelay: '1.2s'}}></div>
      </div>

      {/* Giant Glowing Orbs */}
      <div className="absolute top-10 left-20 w-64 h-64 bg-purple-500/50 rounded-full animate-pulse blur-3xl"></div>
      <div className="absolute top-48 right-10 w-80 h-80 bg-blue-500/40 rounded-full animate-bounce blur-3xl" style={{animationDuration: '4s'}}></div>
      <div className="absolute bottom-24 left-1/4 w-72 h-72 bg-cyan-400/45 rounded-full animate-ping blur-3xl"></div>
      <div className="absolute bottom-32 right-1/4 w-96 h-96 bg-pink-500/35 rounded-full animate-pulse blur-3xl" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-600/30 rounded-full animate-pulse blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Massive Animated Emojis */}
      <div className="absolute top-20 left-1/4 text-8xl opacity-50 animate-spin" style={{animationDuration: '5s'}}>⭐</div>
      <div className="absolute top-40 right-1/5 text-9xl opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}>💪</div>
      <div className="absolute bottom-28 left-1/6 text-8xl opacity-50 animate-pulse" style={{animationDelay: '1s'}}>🏆</div>
      <div className="absolute bottom-56 right-1/4 text-9xl opacity-55 animate-spin" style={{animationDuration: '6s'}}>🔥</div>
      <div className="absolute top-2/3 left-1/3 text-7xl opacity-45 animate-bounce" style={{animationDelay: '0.3s'}}>⚡</div>
      <div className="absolute top-1/3 right-1/3 text-8xl opacity-50 animate-pulse" style={{animationDelay: '0.7s'}}>💯</div>
      <div className="absolute top-1/4 left-1/2 text-7xl opacity-40 animate-spin" style={{animationDuration: '7s'}}>🌟</div>
      
      {/* Corner Glow Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      
      {/* Vertical Light Beams */}
      <div className="absolute top-0 left-1/5 w-4 h-full bg-gradient-to-b from-purple-500/50 via-transparent to-purple-500/50 animate-pulse"></div>
      <div className="absolute top-0 left-2/5 w-3 h-full bg-gradient-to-b from-blue-400/40 via-transparent to-blue-400/40 animate-pulse" style={{animationDelay: '0.4s'}}></div>
      <div className="absolute top-0 left-3/5 w-4 h-full bg-gradient-to-b from-cyan-500/50 via-transparent to-cyan-500/50 animate-pulse" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute top-0 right-1/5 w-3 h-full bg-gradient-to-b from-pink-400/40 via-transparent to-pink-400/40 animate-pulse" style={{animationDelay: '1.2s'}}></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            🏆 ELITE LEADERBOARD 🏆
          </h1>
          <p className="text-lg text-cyan-300 font-medium">Champions ranked by total reps • Elite performance tracker</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Trophy className="mx-auto mb-2 text-purple-400 animate-bounce" size={40} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full animate-ping"></div>
                </div>
                <p className="text-3xl font-bold text-purple-300">
                  {topThree[0]?.totalReps.toLocaleString() || 0}
                </p>
                <p className="text-sm font-semibold text-purple-200">🏆 Champion Score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-950 to-indigo-950 border-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Users className="mx-auto mb-2 text-blue-400 animate-pulse" size={40} />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyan-300 animate-spin" />
                </div>
                <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
                <p className="text-sm font-semibold text-cyan-300">💪 Elite Athletes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-950 to-blue-950 border-cyan-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative">
                  <Award className="mx-auto mb-2 text-cyan-400 animate-pulse" size={40} />
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-pink-300 animate-bounce" />
                </div>
                <p className="text-3xl font-bold text-cyan-200">
                  {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0) / leaderboard.length).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-cyan-300">⚖️ Average Reps</p>
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