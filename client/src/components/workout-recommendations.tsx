import { Dumbbell, Heart, Leaf, ChevronRight } from "lucide-react";

export default function WorkoutRecommendations() {
  const recommendations = [
    {
      name: "Full Body HIIT",
      details: "30 min • High intensity",
      icon: Dumbbell,
      color: "primary",
      bgColor: "blue"
    },
    {
      name: "Cardio Blast",
      details: "20 min • Moderate intensity",
      icon: Heart,
      color: "secondary",
      bgColor: "green"
    },
    {
      name: "Recovery Yoga",
      details: "25 min • Low intensity",
      icon: Leaf,
      color: "purple-600",
      bgColor: "purple"
    }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recommended Workouts</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => {
          const IconComponent = recommendation.icon;
          return (
            <div
              key={recommendation.name}
              className={`flex items-center space-x-4 p-3 bg-gradient-to-r from-${recommendation.bgColor}-50 to-${recommendation.bgColor}-100 rounded-xl hover:from-${recommendation.bgColor}-100 hover:to-${recommendation.bgColor}-200 transition-all cursor-pointer`}
            >
              <div className={`bg-${recommendation.color} bg-opacity-20 rounded-lg p-2`}>
                <IconComponent className={`text-${recommendation.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{recommendation.name}</h4>
                <p className="text-sm text-muted">{recommendation.details}</p>
              </div>
              <ChevronRight className="text-muted" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
