import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MedicalDisclaimer() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong>Medical Disclaimer:</strong> This app provides general fitness and nutritional information for educational purposes only. 
        It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider 
        before starting any new diet, exercise program, or making changes to your health routine, especially if you have existing health conditions.
      </AlertDescription>
    </Alert>
  );
}

export function PageMedicalDisclaimer({ type = "general" }: { type?: "general" | "nutrition" | "exercise" }) {
  const getMessage = () => {
    switch (type) {
      case "nutrition":
        return "The nutritional information and meal plans provided are general guidelines. Calorie and macro recommendations should be verified with a registered dietitian or healthcare provider, especially if you have dietary restrictions, allergies, or medical conditions.";
      case "exercise":
        return "The workout recommendations and exercise plans are general fitness guidelines. Consult with a physician before beginning any exercise program, especially if you have cardiovascular conditions, joint issues, or other health concerns.";
      default:
        return "The health and fitness information provided is for educational purposes only and should not replace professional medical advice.";
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 mb-6">
      <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
        {getMessage()}
      </AlertDescription>
    </Alert>
  );
}

export function AIGeneratedDisclaimer() {
  return (
    <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
      <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <AlertDescription className="text-purple-800 dark:text-purple-200 text-sm">
        <strong>AI-Generated Content:</strong> This plan was created by artificial intelligence based on your inputs. 
        AI-generated recommendations should be reviewed and verified with qualified health professionals before implementation.
      </AlertDescription>
    </Alert>
  );
}
