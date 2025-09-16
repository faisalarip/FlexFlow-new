import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <Activity className="text-red-600" size={32} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlexFlow</h1>
        </div>
        <div className="ml-auto">
          <Button asChild variant="outline">
            <a href="/" data-testid="back-home">Back to Home</a>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FlexFlow ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. These Terms of Service govern your use of the FlexFlow fitness 
                tracking application and related services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Use of the Service</h2>
              <p>FlexFlow provides fitness tracking, workout logging, and wellness management tools. You agree to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Use the Service only for lawful purposes</li>
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Not share your account with others</li>
                <li>Not use the Service to upload harmful or inappropriate content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account information and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Subscription and Payments</h2>
              <p>
                FlexFlow offers both free and premium subscription tiers. Premium subscriptions are billed 
                automatically on a recurring basis. You may cancel your subscription at any time through 
                your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Health and Safety Disclaimer</h2>
              <p>
                FlexFlow is not a substitute for professional medical advice. Always consult with healthcare 
                professionals before starting any fitness program. Use of fitness tracking data should not 
                replace medical supervision for health conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Data Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                use of the Service, to understand our practices regarding your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>
                FlexFlow shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any 
                loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes via email or through the Service. Continued use of the Service after such modifications 
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through the 
                FlexFlow application or website.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}