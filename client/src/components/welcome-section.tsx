import { Plus, Flame } from "lucide-react";

export default function WelcomeSection() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400" 
            alt="Person doing workout" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {greeting}!
          </h2>
          <p className="text-lg opacity-90 mb-4">Ready to crush your fitness goals today?</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
              <Plus />
              <span>Start Workout</span>
            </button>
            <div className="bg-white bg-opacity-20 rounded-xl p-3 flex items-center space-x-3">
              <Flame className="text-accent text-xl" />
              <div>
                <p className="text-sm opacity-80">Current Streak</p>
                <p className="font-bold text-lg">7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
