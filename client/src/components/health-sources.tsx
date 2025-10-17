import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HealthSources() {
  const [isExpanded, setIsExpanded] = useState(false);

  const sources = [
    {
      title: "USDA Dietary Guidelines for Americans",
      description: "Evidence-based nutritional and dietary information for healthy eating patterns",
      url: "https://www.dietaryguidelines.gov/",
    },
    {
      title: "American College of Sports Medicine (ACSM)",
      description: "Exercise guidelines and physical activity recommendations",
      url: "https://www.acsm.org/",
    },
    {
      title: "National Institutes of Health (NIH) - Nutrition",
      description: "Scientific research on nutrition, calories, and healthy eating",
      url: "https://www.nih.gov/health-information/diet-nutrition",
    },
    {
      title: "CDC Physical Activity Guidelines",
      description: "Federal guidelines for physical activity and exercise recommendations",
      url: "https://www.cdc.gov/physicalactivity/basics/index.htm",
    },
    {
      title: "Academy of Nutrition and Dietetics",
      description: "Professional organization providing evidence-based nutrition information",
      url: "https://www.eatright.org/",
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Health & Fitness Sources
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-sources"
          >
            {isExpanded ? "Hide" : "Show"} Sources
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Our health and fitness recommendations are based on guidelines from the following authoritative sources:
          </p>
          {sources.map((source, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {source.description}
                  </p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  data-testid={`link-source-${index}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t">
            Last updated: October 2025. Always consult healthcare professionals for personalized medical advice.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
