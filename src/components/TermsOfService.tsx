import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Bonded ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Eligibility</h2>
              <p className="mb-3">To use Bonded, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Be a current student at a verified educational institution</li>
                <li>Have a valid .edu email address from your institution</li>
                <li>Provide accurate and truthful information</li>
                <li>Not be prohibited from using the Service under applicable law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Account Registration</h2>
              <p className="mb-3">When creating an account, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. User Conduct</h2>
              <p className="mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harass, bully, stalk, or harm other users</li>
                <li>Post or share inappropriate, offensive, or illegal content</li>
                <li>Impersonate another person or misrepresent your identity</li>
                <li>Use the Service for commercial purposes without authorization</li>
                <li>Spam, solicit, or advertise to other users</li>
                <li>Share contact information for the purpose of taking conversations off-platform</li>
                <li>Scrape, copy, or extract data from the Service</li>
                <li>Attempt to hack, reverse engineer, or interfere with the Service</li>
                <li>Use automated systems (bots) to access the Service</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Content Guidelines</h2>
              <p className="mb-3">All content you post must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be appropriate for a college-age audience</li>
                <li>Not contain nudity, sexually explicit material, or suggestive content</li>
                <li>Not promote violence, hate speech, or discrimination</li>
                <li>Not infringe on intellectual property rights</li>
                <li>Not contain personal information of others without consent</li>
              </ul>
              <p className="mt-3">
                We reserve the right to remove any content that violates these guidelines and may suspend or terminate accounts for repeated violations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="mb-3">
                <strong>Your Content:</strong> You retain ownership of content you post. By posting, you grant Bonded a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Service.
              </p>
              <p>
                <strong>Our Content:</strong> All Bonded branding, logos, software, algorithms (including Bond Print), and design elements are owned by Bonded and protected by copyright and trademark law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Privacy and Data</h2>
              <p>
                Your use of the Service is governed by our Privacy Policy. By using Bonded, you consent to our collection and use of your data as described in the Privacy Policy. We take privacy seriously and implement security measures to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Safety and Reporting</h2>
              <p className="mb-3">
                We are committed to providing a safe environment. If you encounter inappropriate behavior or content:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the in-app reporting feature immediately</li>
                <li>Block users who make you uncomfortable</li>
                <li>Contact support@bonded.app for serious concerns</li>
              </ul>
              <p className="mt-3 font-semibold">
                We investigate all reports and take appropriate action, including account suspension or termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Disclaimers</h2>
              <p className="mb-3">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>That you will find compatible roommates or friends</li>
                <li>The accuracy of compatibility scores or Bond Print results</li>
                <li>The behavior or identity claims of other users</li>
                <li>Uninterrupted or error-free service</li>
                <li>That the Service will meet your expectations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BONDED SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO DAMAGES FROM INTERACTIONS WITH OTHER USERS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Account Termination</h2>
              <p className="mb-3">We may suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these Terms or our Community Guidelines</li>
                <li>Engage in behavior that harms other users</li>
                <li>No longer meet eligibility requirements</li>
                <li>Request account deletion</li>
              </ul>
              <p className="mt-3">
                You may delete your account at any time from the settings page. Upon deletion, your data will be permanently removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Third-Party Services</h2>
              <p>
                Bonded uses third-party services (Supabase for hosting, Sentry for error tracking, etc.). Your use of the Service may be subject to additional third-party terms. We are not responsible for third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Dispute Resolution</h2>
              <p>
                Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the laws of [Your Jurisdiction]. You agree to waive your right to participate in class actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">15. Contact Information</h2>
              <p className="mb-2">Questions about these Terms? Contact us:</p>
              <ul className="list-none space-y-1">
                <li>Email: legal@bonded.app</li>
                <li>Support: support@bonded.app</li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Community First</h3>
              <p className="text-sm">
                Bonded is built on trust and respect. By using our Service, you become part of a community dedicated to helping students find meaningful connections. Let's keep it positive and safe for everyone.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
