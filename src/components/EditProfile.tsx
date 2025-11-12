import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface EditProfileProps {
  userProfile: any;
  accessToken: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function EditProfile({ userProfile, accessToken, onComplete, onCancel }: EditProfileProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    major: userProfile.major || '',
    year: userProfile.year || '',
    bio: userProfile.bio || '',
    interests: (userProfile.interests || []).join(', '),
    lookingFor: (userProfile.lookingFor || []).map((item: string) => {
      // Convert from normalized format back to display format
      return item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }).join(', '),
    academicGoals: (userProfile.goals?.academic || []).map((g: string) => {
      return g.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }).join(', '),
    leisureGoals: (userProfile.goals?.leisure || []).map((g: string) => {
      return g.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }).join(', '),
    careerGoal: userProfile.goals?.career || '',
    personalGoal: userProfile.goals?.personal || '',
    additionalInfo: userProfile.additionalInfo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process form data
      const interests = formData.interests.split(',').map(i => i.trim()).filter(Boolean);
      const lookingFor = formData.lookingFor.split(',').map(l => l.trim().toLowerCase().replace(/ /g, '-')).filter(Boolean);
      const academicGoals = formData.academicGoals.split(',').map(g => g.trim().toLowerCase().replace(/ /g, '-')).filter(Boolean);
      const leisureGoals = formData.leisureGoals.split(',').map(g => g.trim().toLowerCase().replace(/ /g, '-')).filter(Boolean);

      const profileData = {
        ...userProfile,
        name: formData.name,
        age: parseInt(formData.age.toString()) || userProfile.age,
        major: formData.major,
        year: formData.year,
        bio: formData.bio,
        interests,
        lookingFor,
        goals: {
          academic: academicGoals,
          leisure: leisureGoals,
          career: formData.careerGoal.trim() || undefined,
          personal: formData.personalGoal.trim() || undefined,
        },
        additionalInfo: formData.additionalInfo.trim() || undefined,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated! 🎉');
      onComplete();
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">About</h3>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell people about yourself..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">Interests</h3>
            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g., Music, Sports, Reading"
              />
            </div>
          </CardContent>
        </Card>

        {/* Looking For */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">Looking For</h3>
            <div>
              <Label htmlFor="lookingFor">Looking For (comma-separated)</Label>
              <Input
                id="lookingFor"
                value={formData.lookingFor}
                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                placeholder="e.g., Friends, Study Partner, Roommate"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">Goals</h3>
            
            <div>
              <Label htmlFor="academicGoals">Academic Goals (comma-separated)</Label>
              <Input
                id="academicGoals"
                value={formData.academicGoals}
                onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                placeholder="e.g., Get Straight A's, Graduate Early"
              />
            </div>

            <div>
              <Label htmlFor="leisureGoals">Leisure Goals (comma-separated)</Label>
              <Input
                id="leisureGoals"
                value={formData.leisureGoals}
                onChange={(e) => setFormData({ ...formData, leisureGoals: e.target.value })}
                placeholder="e.g., Learn Guitar, Travel More"
              />
            </div>

            <div>
              <Label htmlFor="careerGoal">Career Goal</Label>
              <Input
                id="careerGoal"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g., Become a Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="personalGoal">Personal Goal</Label>
              <Input
                id="personalGoal"
                value={formData.personalGoal}
                onChange={(e) => setFormData({ ...formData, personalGoal: e.target.value })}
                placeholder="e.g., Build Better Habits"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4">Additional Information</h3>
            <div>
              <Label htmlFor="additionalInfo">Anything else we should know?</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={3}
                placeholder="Help Link find better connections for you..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#2E7B91] hover:bg-[#25658A]"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

