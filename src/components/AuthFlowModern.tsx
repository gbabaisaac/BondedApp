import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { useAppStore } from '../store/useAppStore';
import '../styles/viewport-fix.css';
import '../styles/tokens.css';
import '../styles/animations.css';
import '../styles/auth-mobile.css';
import '../styles/input-fix.css';

const supabase = getSupabaseClient();

interface AuthFlowModernProps {
  onAuthSuccess: (accessToken: string, userId: string) => void;
}

export function AuthFlowModern({ onAuthSuccess }: AuthFlowModernProps) {
  const handleAuthSuccess = useAppStore((state) => state.handleAuthSuccess);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEduEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('.edu');
  };

  const extractSchool = (email: string): string => {
    try {
      const domain = email.split('@')[1];
      if (!domain) return 'TestUniversity';
      
      const schoolName = domain.replace('.edu', '').split('.').slice(-2, -1)[0];
      if (!schoolName) return 'TestUniversity';
      
      return schoolName.charAt(0).toUpperCase() + schoolName.slice(1);
    } catch (error) {
      return 'TestUniversity';
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const school = email.includes('.edu') ? extractSchool(email) : 'University';
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name,
            school,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorMessage.includes('already been registered') || errorMessage.includes('email_exists')) {
            errorMessage = 'This email is already registered. Please sign in instead.';
          }
        } catch (parseError) {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          if (response.status === 404) {
            errorMessage = 'Service unavailable. Please try again in a moment.';
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Signup successful:', data);

      // Auto sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (signInData.session) {
        console.log('✅ Auto-signin successful, redirecting to profile setup');
        // Pass isNewUser=true to skip profile load and go straight to setup
        await handleAuthSuccess(signInData.session.access_token, signInData.user.id, true);
        onAuthSuccess(signInData.session.access_token, signInData.user.id);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', email);

    try {
      console.log('Calling Supabase signInWithPassword...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data, error: signInError });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (data.session) {
        console.log('Login successful, calling onAuthSuccess');
        await handleAuthSuccess(data.session.access_token, data.user.id);
        onAuthSuccess(data.session.access_token, data.user.id);
      } else {
        throw new Error('No session returned from login');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
        padding: '24px 16px',
        minHeight: '-webkit-fill-available',
      }}
    >
      {/* Floating Background Elements */}
      <motion.div
        className="floating-blob absolute top-10 right-20 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: 'var(--accent-yellow)' }}
        animate={{
          y: [0, 40, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="floating-blob absolute bottom-10 left-20 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: 'var(--accent-green)' }}
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
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
        {/* Logo Header */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '24px' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <motion.div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <span style={{ fontSize: '24px' }}>🎓</span>
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
          <motion.p
            style={{ 
              color: '#6B6B6B',
              fontSize: '15px',
              lineHeight: '1.5',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {mode === 'login' ? 'Welcome back! 👋' : 'Join the community 🎉'}
          </motion.p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          style={{
            borderRadius: '28px',
            padding: '28px 24px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Mode Toggle */}
          <div 
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              marginBottom: '24px',
              borderRadius: '16px',
              background: '#F3F4F6',
            }}
          >
            <motion.button
              type="button"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'login' ? 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)' : 'transparent',
                color: mode === 'login' ? 'white' : '#6B6B6B',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setMode('login');
                setError('');
              }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
            <motion.button
              type="button"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'signup' ? 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)' : 'transparent',
                color: mode === 'signup' ? 'white' : '#6B6B6B',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                    <User className="w-4 h-4" style={{ color: '#A78BFA' }} />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                Email
              </label>
              <Input
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              <p 
                style={{ 
                  color: '#9B9B9B',
                  fontSize: '12px',
                  marginTop: '6px',
                }}
              >
                Use any email for testing (.edu validation disabled)
              </p>
            </div>

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
                <Lock className="w-4 h-4" style={{ color: '#60A5FA' }} />
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert 
                    variant="destructive"
                    className="rounded-xl"
                    style={{
                      background: 'var(--error-bg)',
                      border: '1px solid var(--error)',
                    }}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p style={{ fontSize: 'var(--text-sm)' }}>{error}</p>
                        {error.includes('Invalid') && (
                          <p className="text-xs opacity-80">
                            Tip: If you haven't created test accounts yet, click "Show test accounts" or the setup link below.
                          </p>
                        )}
                        {error.includes('already registered') && mode === 'signup' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode('login');
                              setError('');
                            }}
                            className="text-xs underline mt-1 opacity-90 hover:opacity-100"
                          >
                            Click here to sign in instead
                          </button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div whileTap={{ scale: loading ? 1 : 0.98 }} style={{ marginTop: '8px' }}>
              <Button 
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  background: loading 
                    ? '#D1D5DB' 
                    : 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 107, 107, 0.3)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
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
          transition={{ delay: 0.6 }}
        >
          Built with ❤️ for college communities
        </motion.p>
      </motion.div>
    </div>
  );
}

