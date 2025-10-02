import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Users, Crown, Star, Sparkles, Flame, Zap, Target } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankTitle = (rank: number) => {
    if (rank === 1) return "🏆 LEGEND";
    if (rank === 2) return "🥈 ELITE MASTER";
    if (rank === 3) return "🥉 CHAMPION";
    if (rank <= 10) return "⚡ TOP 10 ELITE";
    if (rank <= 50) return "🔥 TOP 50 WARRIOR";
    return "💪 COMPETITOR";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: "text-yellow-400", glow: "shadow-yellow-500/50" };
    if (rank === 2) return { icon: Trophy, color: "text-gray-300", glow: "shadow-gray-400/50" };
    if (rank === 3) return { icon: Medal, color: "text-orange-400", glow: "shadow-orange-500/50" };
    if (rank <= 10) return { icon: Flame, color: "text-red-500", glow: "shadow-red-500/50" };
    if (rank <= 50) return { icon: Zap, color: "text-purple-500", glow: "shadow-purple-500/50" };
    return { icon: Target, color: "text-gray-400", glow: "shadow-gray-500/50" };
  };

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
        return "bg-gradient-to-br from-yellow-950 via-yellow-900 to-black border-yellow-500 shadow-yellow-500/30";
      case 2:
        return "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-gray-400 shadow-gray-400/30";
      case 3:
        return "bg-gradient-to-br from-orange-950 via-orange-900 to-black border-orange-500 shadow-orange-500/30";
      default:
        if (rank <= 10) return "bg-gradient-to-br from-red-950 via-red-900 to-black border-red-600 shadow-red-600/20";
        if (rank <= 50) return "bg-gradient-to-br from-purple-950 via-purple-900 to-black border-purple-700 shadow-purple-700/20";
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700";
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
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4 animate-pulse">
              🔥 ELITE LEADERBOARD 🔥
            </h1>
            <p className="text-xl text-red-400 font-bold">Loading the champions...</p>
          </div>
          
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gradient-to-r from-red-900/20 to-transparent rounded-lg"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black relative overflow-hidden">
      {/* Floating Background Elements - More Dynamic */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500/10 rounded-full animate-pulse blur-xl"></div>
      <div className="absolute top-32 right-16 w-24 h-24 bg-red-500/15 rounded-full animate-bounce blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-600/10 rounded-full animate-ping blur-xl"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-red-500/20 rounded-full animate-pulse blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-600/5 rounded-full animate-pulse blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-pulse drop-shadow-2xl">
              🏆 ELITE CHAMPIONS 🏆
            </h1>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce">✨</div>
          </div>
          <p className="text-xl text-red-300 font-bold">🔥 Ranked by Total Reps • Legends Only 🔥</p>
          <div className="mt-4 flex justify-center space-x-3">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-500/50"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-orange-400 rounded-full animate-bounce shadow-lg shadow-orange-500/50" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Stats Overview - More Exciting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-950 via-yellow-900 to-black border-2 border-yellow-400 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-110 transform">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent animate-pulse"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="text-center">
                <div className="relative">
                  <Crown className="mx-auto mb-3 text-yellow-400 animate-bounce drop-shadow-lg" size={48} />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-4xl font-black text-yellow-400 drop-shadow-lg animate-pulse">
                  {topThree[0]?.totalReps.toLocaleString() || 0}
                </p>
                <p className="text-sm font-bold text-yellow-300 mt-2">👑 LEGEND'S SCORE 👑</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-black border-2 border-red-500 shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-110 transform">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="text-center">
                <div className="relative">
                  <Users className="mx-auto mb-3 text-red-400 animate-pulse drop-shadow-lg" size={48} />
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-red-300 animate-spin" />
                </div>
                <p className="text-4xl font-black text-white drop-shadow-lg">{leaderboard.length}</p>
                <p className="text-sm font-bold text-red-300 mt-2">💪 WARRIORS UNITE! 💪</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-950 via-orange-900 to-black border-2 border-orange-500 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 transform">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent animate-pulse"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="text-center">
                <div className="relative">
                  <Award className="mx-auto mb-3 text-orange-400 animate-pulse drop-shadow-lg" size={48} />
                  <Star className="absolute -top-2 -right-2 w-5 h-5 text-orange-300 animate-bounce" />
                </div>
                <p className="text-4xl font-black text-orange-400 drop-shadow-lg">
                  {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0) / leaderboard.length).toLocaleString()}
                </p>
                <p className="text-sm font-bold text-orange-300 mt-2">⚡ BEAST AVG ⚡</p>
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
                        <div className={`w-20 h-20 rounded-full border-4 ${entry.rank === 1 ? 'border-yellow-500 shadow-yellow-500/50' : entry.rank === 2 ? 'border-gray-400 shadow-gray-400/50' : 'border-orange-500 shadow-orange-500/50'} shadow-xl flex items-center justify-center bg-gradient-to-br ${entry.rank === 1 ? 'from-yellow-950 to-black' : entry.rank === 2 ? 'from-gray-800 to-gray-900' : 'from-orange-950 to-black'}`}>
                          <span className={`text-2xl font-bold ${entry.rank === 1 ? 'text-yellow-300' : entry.rank === 2 ? 'text-gray-300' : 'text-orange-300'}`}>
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
                            <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                          </>
                        )}
                        {entry.rank === 2 && (
                          <div className="absolute -top-2 -right-2 w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        )}
                        {entry.rank === 3 && (
                          <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* Winner Info */}
                      <div className="text-center mb-4 px-2">
                        <h3 className={`font-bold text-lg ${entry.rank === 1 ? 'text-white' : entry.rank === 2 ? 'text-gray-200' : 'text-orange-200'} mb-1`}>
                          {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                        </h3>
                        <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                        <div className="mt-2">
                          <p className={`text-2xl font-bold ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`}>
                            {entry.totalReps.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">total reps</p>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs font-bold ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`}>
                            {getRankTitle(entry.rank)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Podium Platform */}
                      <div className={`w-24 ${getPodiumHeight(entry.rank)} ${getRankBgColor(entry.rank)} border-2 rounded-t-lg shadow-xl relative overflow-hidden`}>
                        {/* Podium Rank Number */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-4xl font-black ${entry.rank === 1 ? 'text-yellow-600' : entry.rank === 2 ? 'text-gray-600' : 'text-orange-600'} opacity-40`}>
                            {entry.rank}
                          </span>
                        </div>
                        {/* Shimmer Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${entry.rank === 1 ? 'via-yellow-500/10' : entry.rank === 2 ? 'via-gray-500/10' : 'via-orange-500/10'} to-transparent animate-pulse`}></div>
                        {/* Base Platform */}
                        <div className={`absolute bottom-0 w-full h-2 ${entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-400' : 'bg-orange-500'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Celebration Message - More Exciting */}
                <div className="relative text-center mt-8 p-6 bg-gradient-to-r from-yellow-950 via-red-950 to-orange-950 rounded-xl border-2 border-yellow-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-orange-500/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <p className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-orange-400 bg-clip-text text-transparent mb-3 animate-pulse">
                      🎆 LEGENDARY PERFORMANCE! 🎆
                    </p>
                    <p className="text-base text-red-300 font-bold">💎 The Elite Few! Unmatched Dedication! Pure Excellence! 💎</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top 10 Elite Section */}
        {leaderboard.filter(e => e.rank <= 10 && e.rank > 3).length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-red-950 via-red-900 to-black border-2 border-red-600 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-2xl font-bold text-red-400">
                <Flame className="mr-2 text-red-500 animate-pulse" size={28} />
                ⚡ TOP 10 ELITE PERFORMERS ⚡
                <Flame className="ml-2 text-red-500 animate-pulse" size={28} />
              </CardTitle>
              <p className="text-red-300 text-sm mt-2">The best of the best - unstoppable forces!</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.filter(e => e.rank <= 10 && e.rank > 3).map((entry) => {
                  const badge = getRankBadge(entry.rank);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={entry.userId}
                      className={`relative flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)} transition-all hover:shadow-xl hover:scale-[1.02] overflow-hidden`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 animate-pulse"></div>
                      <div className="relative flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center border-2 border-red-500 shadow-lg">
                              <BadgeIcon className={badge.color} size={24} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-950 rounded-full border border-red-500 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{entry.rank}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">
                              {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                            </h4>
                            <span className="text-xs font-bold text-red-400 bg-red-950 px-2 py-1 rounded">
                              {getRankTitle(entry.rank)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                        </div>
                      </div>
                      
                      <div className="relative text-right">
                        <p className="text-2xl font-bold text-red-400">
                          {entry.totalReps.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">reps</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 50 Warriors Section */}
        {leaderboard.filter(e => e.rank <= 50 && e.rank > 10).length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-purple-950 via-purple-900 to-black border-2 border-purple-700 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-2xl font-bold text-purple-400">
                <Zap className="mr-2 text-purple-500 animate-pulse" size={28} />
                🔥 TOP 50 WARRIORS 🔥
                <Zap className="ml-2 text-purple-500 animate-pulse" size={28} />
              </CardTitle>
              <p className="text-purple-300 text-sm mt-2">Rising stars making their mark!</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.filter(e => e.rank <= 50 && e.rank > 10).map((entry) => {
                  const badge = getRankBadge(entry.rank);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={entry.userId}
                      className={`relative flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)} transition-all hover:shadow-xl hover:scale-[1.02]`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center border-2 border-purple-500">
                              <BadgeIcon className={badge.color} size={20} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-950 rounded-full border border-purple-500 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{entry.rank}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">
                              {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                            </h4>
                            <span className="text-xs font-bold text-purple-400 bg-purple-950 px-2 py-1 rounded">
                              {getRankTitle(entry.rank)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-400">
                          {entry.totalReps.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">reps</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rest of Leaderboard */}
        {leaderboard.filter(e => e.rank > 50).length > 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">💪 All Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.filter(e => e.rank > 50).map((entry) => {
                  const badge = getRankBadge(entry.rank);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)} transition-all hover:shadow-md`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600">
                              <BadgeIcon className={badge.color} size={20} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full border border-gray-600 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{entry.rank}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.email?.split('@')[0] || 'User'}
                          </h4>
                          <p className="text-sm text-gray-400">@{entry.email?.split('@')[0] || 'user'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-400">
                          {entry.totalReps.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">reps</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips - More Exciting */}
        <Card className="mt-8 relative overflow-hidden bg-gradient-to-br from-red-950 via-black to-orange-950 border-2 border-red-500 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
          <CardContent className="pt-8 pb-8 relative z-10">
            <div className="text-center">
              <div className="mb-4">
                <Trophy className="mx-auto text-yellow-400 animate-bounce drop-shadow-lg" size={48} />
              </div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent mb-3">
                🔥 CLAIM YOUR THRONE! 🔥
              </h3>
              <p className="text-red-300 mb-6 font-bold text-lg">
                💪 Crush workouts • Stack reps • Dominate the board • Become LEGENDARY! 💪
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-base">
                <span className="px-4 py-2 bg-red-900/50 border border-red-500 rounded-lg text-red-300 font-bold hover:scale-110 transition-transform">
                  🏋️ Heavy Lifts
                </span>
                <span className="px-4 py-2 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-300 font-bold hover:scale-110 transition-transform">
                  🔥 Max Reps
                </span>
                <span className="px-4 py-2 bg-orange-900/50 border border-orange-500 rounded-lg text-orange-300 font-bold hover:scale-110 transition-transform">
                  💎 Daily Grind
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}