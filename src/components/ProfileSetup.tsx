import React from 'react';
import { OnboardingFlowModern } from './onboarding/OnboardingFlowModern';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAppStore } from '../store/useAppStore';

interface ProfileSetupProps {
  onComplete: (profile: any) => void;
  existingProfile?: any;
}

export function ProfileSetup({ onComplete, existingProfile }: ProfileSetupProps) {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUserInfo = async () => {
      // Get access token from store
      const token = useAppStore.getState().accessToken;
      
      // If editing existing profile, use that data
      if (existingProfile) {
        setUserInfo({
          email: existingProfile.email || '',
          name: existingProfile.name || '',
          school: existingProfile.school || '',
        });
        setLoading(false);
        return;
      }
      
      // Skip user info fetch if no token
      if (!token) {
        setUserInfo({
          email: '',
          name: '',
          school: '',
        });
        setLoading(false);
        return;
      }

      try {
        // Fetch user info from our backend endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/user-info`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            email: data.email || '',
            name: data.name || '',
            school: data.school || '',
          });
        } else {
          // Fallback to empty strings if endpoint fails
          setUserInfo({
            email: '',
            name: '',
            school: '',
          });
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        // Fallback to empty strings
        setUserInfo({
          email: '',
          name: '',
          school: '',
        });
      } finally {
        setLoading(false);
      }
    };
    loadUserInfo();
  }, [existingProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleComplete = (profile: any) => {
    console.log('🎉 ProfileSetup handleComplete called');
    console.log('📦 Profile data:', profile);
    console.log('🔄 Calling parent onComplete...');
    onComplete(profile);
  };

  return (
    <OnboardingFlowModern
      userName={userInfo?.name || existingProfile?.name || ''}
      onComplete={handleComplete}
    />
  );
}
