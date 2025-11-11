import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';

const supabase = getSupabaseClient();

interface AuthFlowProps {
  onAuthSuccess: (accessToken: string, userId: string) => void;
}

export function AuthFlow({ onAuthSuccess }: AuthFlowProps) {
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

    // .edu validation disabled for testing
    // if (!validateEduEmail(email)) {
    //   setError('Please use a valid .edu email address');
    //   setLoading(false);
    //   return;
    // }

    try {
      // School will be selected during onboarding, use placeholder for now
      const school = email.includes('.edu') ? extractSchool(email) : 'Pending';
      
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

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a duplicate email error
        if (data.error && (data.error.includes('already been registered') || data.error.includes('email_exists'))) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw new Error(data.error || 'Signup failed');
      }

      // Auto sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (signInData.session) {
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

    // .edu validation disabled for testing
    // if (!validateEduEmail(email)) {
    //   setError('Please use a valid .edu email address');
    //   setLoading(false);
    //   return;
    // }

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
    <div className="min-h-screen p-4 py-8 pb-24">
      <div className="w-full max-w-md mx-auto space-y-4">

        <Card className="w-full">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/bonded-icon.png" 
                alt="bonded logo" 
                className="w-12 h-12"
              />
              <h1 className="text-4xl bg-gradient-to-r from-[#2E7B91] to-[#25658A] bg-clip-text text-transparent lowercase font-bold tracking-wide">
                bonded
              </h1>
            </div>
            <CardTitle>
              {mode === 'login' ? 'Welcome Back' : 'Join bonded'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Sign in to connect with your campus community'
                : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Use any email for testing (.edu validation disabled)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>{error}</p>
                    {error.includes('Invalid') && (
                      <p className="text-xs">
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
                        className="text-xs underline mt-1 text-white hover:text-gray-200"
                      >
                        Click here to sign in instead
                      </button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
