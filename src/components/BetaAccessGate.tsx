import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';

interface BetaAccessGateProps {
  onAccessGranted: () => void;
  children: React.ReactNode;
}

// Beta access codes - add emails here for closed beta
const BETA_EMAILS = [
  '@uri.edu',        // University of Rhode Island
  '@illinois.edu',   // University of Illinois
  '@stanford.edu',
  '@berkeley.edu',
];

export function BetaAccessGate({ onAccessGranted, children }: BetaAccessGateProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user already has access (stored in localStorage)
    const storedAccess = localStorage.getItem('betaAccess');
    if (storedAccess === 'granted') {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
    setLoading(false);
  }, []);

  // Listen for storage changes (in case logout clears localStorage)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedAccess = localStorage.getItem('betaAccess');
      if (storedAccess !== 'granted') {
        setHasAccess(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case of same-tab changes
    const interval = setInterval(() => {
      const storedAccess = localStorage.getItem('betaAccess');
      if (storedAccess !== 'granted' && hasAccess) {
        setHasAccess(false);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [hasAccess]);

  const checkAccess = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Check if email is in beta list
    const hasAccess = BETA_EMAILS.some(allowed => 
      email.toLowerCase().endsWith(allowed.toLowerCase()) ||
      email.toLowerCase() === allowed.toLowerCase()
    );

    if (hasAccess) {
      localStorage.setItem('betaAccess', 'granted');
      localStorage.setItem('betaEmail', email);
      setHasAccess(true);
      onAccessGranted();
      toast.success('Welcome to the beta! 🎉');
    } else {
      toast.error('Sorry, this email is not on the beta list yet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F6F3] to-[#EAEAEA]">
        <p className="text-[#1E4F74]">Loading...</p>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F6F3] to-[#EAEAEA] p-4 pb-24">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#2E7B91] to-[#25658A] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl text-center mb-2 bg-gradient-to-r from-[#2E7B91] to-[#25658A] bg-clip-text text-transparent lowercase font-bold tracking-wide">
            bonded
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Social networking for college students
          </p>

          {/* Beta Notice */}
          <div className="bg-[#2E7B9115] border border-[#2E7B9140] rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#2E7B91] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[#1E4F74] mb-1">Closed Beta</h3>
                <p className="text-sm text-[#25658A]">
                  bonded is currently in private beta. Enter your .edu email to check if you have access.
                </p>
              </div>
            </div>
          </div>

          {/* Access Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                University Email
              </label>
              <Input
                type="email"
                placeholder="yourname@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAccess()}
                className="w-full"
              />
            </div>

            <Button 
              onClick={checkAccess}
              className="w-full bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white rounded-2xl"
              size="lg"
            >
              Check Access
            </Button>
          </div>

          {/* Request Access */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600 mb-2">
              Don't have access yet?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = 'mailto:youremail@university.edu?subject=bonded Beta Access Request&body=Hi, I\'d love to join the bonded beta!';
              }}
            >
              Request Beta Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
