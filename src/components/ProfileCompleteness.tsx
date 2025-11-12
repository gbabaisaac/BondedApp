import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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

  if (isComplete && !onComplete) {
    return null; // Don't show if complete and no action needed
  }

  return (
    <Card className={`${!isComplete ? 'border-yellow-200 bg-yellow-50/50' : 'border-green-200 bg-green-50/50'}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          <h3 className="font-medium text-[#1E4F74]">
            Profile Completeness
          </h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#475569]">{percentage}% Complete</span>
              {isComplete && (
                <span className="text-xs text-green-600 font-medium">Great job! 🎉</span>
              )}
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {!isComplete && missing.length > 0 && (
            <div>
              <p className="text-xs text-[#64748b] mb-2">Add these to improve your profile:</p>
              <ul className="text-xs text-[#475569] space-y-1">
                {missing.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {item}
                  </li>
                ))}
                {missing.length > 3 && (
                  <li className="text-[#64748b]">+{missing.length - 3} more</li>
                )}
              </ul>
            </div>
          )}

          {onComplete && !isComplete && (
            <Button
              onClick={onComplete}
              size="sm"
              className="w-full bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white"
            >
              Complete Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

