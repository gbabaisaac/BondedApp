import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
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
  const [interests, setInterests] = useState<string[]>(userProfile.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    major: userProfile.major || '',
    year: userProfile.year || '',
    bio: userProfile.bio || '',
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

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process form data
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
        interests: interests,
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
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-800/50 rounded-full transition-colors -ml-2 text-soft-cream"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-soft-cream">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Basic Info */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">Basic Information</h3>
            
            <div>
              <Label htmlFor="name" className="text-soft-cream">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-soft-cream">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-gray-800/50 border-gray-700/50 text-soft-cream"
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-soft-cream">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="bg-gray-800/50 border-gray-700/50 text-soft-cream"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="major" className="text-soft-cream">Major</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">About</h3>
            <div>
              <Label htmlFor="bio" className="text-soft-cream">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell people about yourself..."
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interests - Tag Editor */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">Interests</h3>
            <div className="space-y-3">
              {/* Existing Tags */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, idx) => (
                    <Badge
                      key={idx}
                      className="bg-teal-blue/20 text-teal-blue border border-teal-blue/30 px-3 py-1.5 text-sm rounded-full flex items-center gap-2"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:bg-teal-blue/30 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add New Interest */}
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  placeholder="Add an interest..."
                  className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
                />
                <Button
                  type="button"
                  onClick={addInterest}
                  className="bg-teal-blue hover:bg-teal-blue/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Looking For */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">Looking For</h3>
            <div>
              <Label htmlFor="lookingFor" className="text-soft-cream">Looking For (comma-separated)</Label>
              <Input
                id="lookingFor"
                value={formData.lookingFor}
                onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                placeholder="e.g., Friends, Study Partner, Roommate"
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">Goals</h3>
            
            <div>
              <Label htmlFor="academicGoals" className="text-soft-cream">Academic Goals (comma-separated)</Label>
              <Input
                id="academicGoals"
                value={formData.academicGoals}
                onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                placeholder="e.g., Get Straight A's, Graduate Early"
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="leisureGoals" className="text-soft-cream">Leisure Goals (comma-separated)</Label>
              <Input
                id="leisureGoals"
                value={formData.leisureGoals}
                onChange={(e) => setFormData({ ...formData, leisureGoals: e.target.value })}
                placeholder="e.g., Learn Guitar, Travel More"
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="careerGoal" className="text-soft-cream">Career Goal</Label>
              <Input
                id="careerGoal"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g., Become a Software Engineer"
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="personalGoal" className="text-soft-cream">Personal Goal</Label>
              <Input
                id="personalGoal"
                value={formData.personalGoal}
                onChange={(e) => setFormData({ ...formData, personalGoal: e.target.value })}
                placeholder="e.g., Build Better Habits"
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-gray-900/80 border-gray-700/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium mb-4 text-soft-cream">Additional Information</h3>
            <div>
              <Label htmlFor="additionalInfo" className="text-soft-cream">Anything else we should know?</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={3}
                placeholder="Help Link find better connections for you..."
                className="bg-gray-800/50 border-gray-700/50 text-soft-cream placeholder:text-gray-400"
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
            className="flex-1 bg-teal-blue hover:bg-teal-blue/90"
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

