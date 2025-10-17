import { MedicalDisclaimer } from "@/components/medical-disclaimer";

export function AppFooter() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <MedicalDisclaimer />
        </div>
        
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} FlexFlow. For educational purposes only.{" "}
            <span className="font-semibold">Always consult healthcare professionals before making health changes.</span>
          </p>
          <div className="mt-2 space-x-4">
            <a href="/terms-of-service" className="hover:text-primary">Terms of Service</a>
            <span>•</span>
            <a href="/privacy-policy" className="hover:text-primary">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
