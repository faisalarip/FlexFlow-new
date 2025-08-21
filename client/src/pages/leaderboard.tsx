import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Users } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
          {rank}
        </div>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Rankings based on total reps completed across all workouts</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="mx-auto mb-2 text-yellow-500" size={32} />
                <p className="text-2xl font-bold text-gray-900">
                  {topThree[0]?.totalReps.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600">Top Score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="mx-auto mb-2 text-blue-500" size={32} />
                <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="mx-auto mb-2 text-green-500" size={32} />
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0) / leaderboard.length).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Average Reps</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 text-yellow-500" size={24} />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`p-6 rounded-lg border-2 ${getRankBgColor(entry.rank)} text-center`}
                  >
                    <div className="mb-3">
                      {getRankIcon(entry.rank)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {entry.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">@{entry.username}</p>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-primary">
                        {entry.totalReps.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">total reps</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                      <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                      <p className="text-sm text-gray-600">@{entry.username}</p>
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