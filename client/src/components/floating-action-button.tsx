import { Plus } from "lucide-react";

export default function FloatingActionButton() {
  const handleQuickStart = () => {
    // This would typically open a quick workout modal or navigate to workout creation
    console.log("Quick start workout");
  };

  return (
    <button
      onClick={handleQuickStart}
      className="fixed bottom-20 md:bottom-6 right-6 bg-accent hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30"
    >
      <Plus className="text-xl" />
    </button>
  );
}
