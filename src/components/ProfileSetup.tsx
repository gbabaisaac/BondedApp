import React from 'react';
import { OnboardingWizard } from './OnboardingWizard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileSetupProps {
  accessToken: string;
  onComplete: (profile: any) => void;
  existingProfile?: any;
}

export function ProfileSetup({ accessToken, onComplete, existingProfile }: ProfileSetupProps) {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUserInfo = async () => {
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

      try {
        // Fetch user info from our backend endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/user-info`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
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
  }, [accessToken, existingProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <OnboardingWizard
      userEmail={userInfo?.email || ''}
      userName={userInfo?.name || ''}
      userSchool={userInfo?.school || ''}
      accessToken={accessToken}
      onComplete={onComplete}
    />
  );
}
