import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Lock, Sparkles, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import '../styles/viewport-fix.css';
import '../styles/tokens.css';
import '../styles/animations.css';
import '../styles/auth-mobile.css';
import '../styles/input-fix.css';

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

  console.log('🔐 BetaAccessGate rendered - hasAccess:', hasAccess, 'loading:', loading);

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
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
        padding: '24px 16px',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available',
      }}
    >
      {/* Floating Background Elements */}
      <motion.div
        className="floating-blob absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: 'var(--primary-coral)' }}
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="floating-blob absolute bottom-20 right-10 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: 'var(--secondary-blue)' }}
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="w-full"
        style={{ 
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className="w-full overflow-hidden relative"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '28px',
          }}
        >
          <CardContent style={{ padding: '32px 24px' }}>
            {/* Logo */}
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                  }}
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <span className="text-2xl">🎓</span>
                </motion.div>
                <h1 
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                  }}
                >
                  bonded
                </h1>
              </div>
              <p
                style={{ 
                  color: '#6B6B6B',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                Social networking for college students 🎓
              </p>
            </motion.div>

            {/* Beta Notice */}
            <motion.div
              style={{
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(96, 165, 250, 0.08) 100%)',
                border: '1.5px solid rgba(167, 139, 250, 0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Shimmer effect */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.15,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  animation: 'shimmer 3s infinite',
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 10 }}>
                <div 
                  style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 
                    style={{ 
                      color: '#1A1D2E',
                      fontSize: '16px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Closed Beta
                  </h3>
                  <p 
                    style={{ 
                      color: '#6B6B6B',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    bonded is currently in private beta. Enter your .edu email to check if you have access.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Access Form */}
            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <label 
                  style={{ 
                    color: '#1A1D2E',
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Mail className="w-4 h-4" style={{ color: '#FF6B6B' }} />
                  University Email
                </label>
                <Input
                  type="email"
                  placeholder="yourname@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAccess()}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '2px solid #E8E8F0',
                    background: '#F8F9FA',
                    fontSize: '16px',
                    color: '#1A1D2E',
                    outline: 'none',
                  }}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={checkAccess}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Check Access
                </Button>
              </motion.div>
            </motion.div>

            {/* Request Access */}
            <motion.div
              style={{ 
                marginTop: '24px',
                paddingTop: '24px',
                textAlign: 'center',
                borderTop: '1px solid #E8E8F0',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p 
                style={{ 
                  color: '#6B6B6B',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '12px',
                }}
              >
                Don't have access yet?
              </p>
              <button
                style={{ 
                  color: '#A78BFA',
                  fontSize: '15px',
                  fontWeight: '700',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                }}
                onClick={() => {
                  window.location.href = 'mailto:youremail@university.edu?subject=bonded Beta Access Request&body=Hi, I\'d love to join the bonded beta!';
                }}
              >
                <Sparkles className="w-4 h-4" />
                Request Beta Access
              </button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <motion.p
          style={{ 
            color: '#9B9B9B',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center',
            marginTop: '24px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Built with ❤️ for college communities
        </motion.p>
      </motion.div>
    </div>
  );
}
