import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, Bug, Megaphone } from "lucide-react";
import { format } from "date-fns";
import type { News } from "@shared/schema";

export default function NewsPage() {
  const { data: newsItems, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "feature":
        return <TrendingUp className="w-4 h-4" />;
      case "bug_fix":
        return <Bug className="w-4 h-4" />;
      case "announcement":
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "feature":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "bug_fix":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "announcement":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "feature":
        return "New Feature";
      case "bug_fix":
        return "Bug Fix";
      case "announcement":
        return "Announcement";
      default:
        return "Update";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header - Mobile-first with large titles */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Newspaper className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              What's New
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 ml-14 md:ml-16">
            Latest updates and improvements to FlexFlow
          </p>
        </div>

        {/* News Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 md:p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : newsItems && newsItems.length > 0 ? (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                data-testid={`news-item-${item.id}`}
              >
                {/* Image if present */}
                {item.imageUrl && (
                  <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      data-testid={`news-image-${item.id}`}
                    />
                  </div>
                )}

                <div className="p-5 md:p-6">
                  {/* Category Badge and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={`${getCategoryColor(item.category)} flex items-center gap-1.5 px-3 py-1 text-xs md:text-sm font-medium`}
                      data-testid={`news-category-${item.id}`}
                    >
                      {getCategoryIcon(item.category)}
                      {getCategoryLabel(item.category)}
                    </Badge>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400" data-testid={`news-date-${item.id}`}>
                      {format(new Date(item.publishedAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
                    data-testid={`news-title-${item.id}`}
                  >
                    {item.title}
                  </h2>

                  {/* Content */}
                  <div
                    className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                    data-testid={`news-content-${item.id}`}
                  >
                    {item.content}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full">
                <Newspaper className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No news yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for updates and announcements!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
