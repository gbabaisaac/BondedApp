import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface ProfileCompletenessProps {
  userProfile: any;
  onComplete?: () => void;
}

export function ProfileCompleteness({ userProfile, onComplete }: ProfileCompletenessProps) {
  const calculateCompleteness = (): { percentage: number; missing: string[] } => {
    const missing: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Required fields (40 points)
    if (userProfile?.name) score += 10;
    else missing.push('Name');
    
    if (userProfile?.photos && userProfile.photos.length > 0) score += 10;
    else missing.push('Profile Photo');
    
    if (userProfile?.bio) score += 10;
    else missing.push('Bio');
    
    if (userProfile?.school) score += 10;
    else missing.push('School');

    // Important fields (30 points)
    if (userProfile?.major) score += 10;
    else missing.push('Major');
    
    if (userProfile?.year) score += 10;
    else missing.push('Year');
    
    if (userProfile?.interests && userProfile.interests.length > 0) score += 10;
    else missing.push('Interests');

    // Optional but valuable (30 points)
    if (userProfile?.lookingFor && userProfile.lookingFor.length > 0) score += 10;
    else missing.push('Looking For');
    
    if (userProfile?.bondPrint) score += 10;
    else missing.push('Bond Print');
    
    if (userProfile?.goals && (userProfile.goals.academic?.length > 0 || userProfile.goals.leisure?.length > 0)) score += 10;
    else missing.push('Goals');

    return { percentage: Math.min(score, maxScore), missing };
  };

  const { percentage, missing } = calculateCompleteness();
  const isComplete = percentage >= 80;

  // Don't show if complete and no action needed, or if percentage is very low (user just started)
  if ((isComplete && !onComplete) || percentage < 30) {
    return null;
  }

  // Make it less prominent - just a helpful tip, not a barrier
  return (
    <Card className="border-blue-100 bg-blue-50/30">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#475569] mb-1.5">
              <span className="font-medium">Tip:</span> Add more info to your profile to help others get to know you better
            </p>
            {missing.length > 0 && missing.length <= 3 && (
              <div className="flex flex-wrap gap-1.5">
                {missing.slice(0, 3).map((item) => (
                  <span key={item} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            )}
            {onComplete && (
              <Button
                onClick={onComplete}
                size="sm"
                variant="ghost"
                className="mt-2 h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                Add info →
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

