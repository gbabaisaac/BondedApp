import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address (.edu), university, year, major</li>
                <li><strong>Profile Information:</strong> Bio, interests, photos, living preferences, personality traits</li>
                <li><strong>Bond Print Data:</strong> Personality quiz responses and compatibility scores</li>
                <li><strong>Communication Data:</strong> Messages, connection requests, and interactions with other users</li>
                <li><strong>Usage Data:</strong> How you interact with our service, pages viewed, features used</li>
                <li><strong>Device Information:</strong> IP address, browser type, device identifiers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Match you with compatible roommates and friends</li>
                <li>Calculate compatibility scores using our Bond Print algorithm</li>
                <li>Send you service updates, security alerts, and support messages</li>
                <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="mb-3">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Other Users:</strong> Your profile information is visible to other verified students at your university</li>
                <li><strong>Service Providers:</strong> Third parties who provide services on our behalf (hosting, analytics, email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>With Your Consent:</strong> Other cases with your explicit permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Your Rights (GDPR Compliance)</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at privacy@bonded.app</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we delete your data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
              <p>
                Our service is intended for users 18 years and older. We do not knowingly collect information from users under 18. If you believe we have collected information from someone under 18, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
              <p className="mb-2">If you have questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-1">
                <li>Email: privacy@bonded.app</li>
                <li>Email: support@bonded.app</li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Privacy Matters</h3>
              <p className="text-sm">
                At Bonded, we are committed to protecting your privacy and ensuring transparency about how we handle your data. We will never sell your personal information to third parties.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
