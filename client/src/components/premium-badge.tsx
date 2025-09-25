import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function PremiumBadge() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const isPremium = user?.subscriptionStatus === "active";

  if (isPremium) {
    return (
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:from-yellow-500 hover:to-orange-600" data-testid="premium-badge">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </div>
    );
  }

  return (
    <Button
      asChild
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-sm px-2 py-1 h-auto text-xs"
      data-testid="upgrade-button"
    >
      <Link href="/subscription">
        <Sparkles className="w-3 h-3 mr-1" />
        Upgrade
      </Link>
    </Button>
  );
}