import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Settings, 
  Star, 
  TrendingUp,
  Award,
  MapPin,
  Lock,
  Eye
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { motion } from 'framer-motion';

interface LoveModeProfileProps {
  userProfile: any;
  accessToken: string;
  onDeactivate: () => void;
}

export function LoveModeProfile({ userProfile, accessToken, onDeactivate }: LoveModeProfileProps) {
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    totalMatches: 0,
    activeConversations: 0,
    profileViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2516be19/love-mode/stats`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-3">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl mb-1">Love Mode Profile</h2>
          <p className="text-gray-600 text-sm">Your romantic connection journey</p>
        </div>

        {/* Profile Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={userProfile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl">
                  {userProfile.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl mb-1">{userProfile.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile.school}</span>
                </div>
                {userProfile.major && (
                  <p className="text-sm text-gray-600">{userProfile.major}</p>
                )}
              </div>
            </div>

            <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-pink-900 font-medium">How others see you:</p>
                  <p className="text-xs text-pink-800 mt-1">
                    This is what people see when rating your profile in Love Mode.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-pink-100 to-pink-50">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-pink-900">{stats.totalRatings}</div>
                <div className="text-xs text-pink-700">Profiles Rated</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-100 to-purple-50">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{stats.totalMatches}</div>
                <div className="text-xs text-purple-700">AI Matches</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-100 to-red-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-900">{stats.activeConversations}</div>
                <div className="text-xs text-red-700">Active Chats</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-100 to-blue-50">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {userProfile.hasCompletedBondPrint ? '✓' : '-'}
                </div>
                <div className="text-xs text-blue-700">Bond Print</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bond Print Status */}
        {!userProfile.hasCompletedBondPrint && (
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 mb-1">Complete Your Bond Print</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Get better AI matches by completing your personality analysis. It takes just 5 minutes!
                  </p>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Take Bond Print Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy & Settings */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Privacy & Settings
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Rating Privacy</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Private
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Profile Visibility</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Distance Range</span>
                <Badge variant="secondary">20 miles</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Matching Works */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">How Your Matches Work</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Link's AI analyzes your ratings and Bond Print for compatibility</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>When both of you rate each other 7+, a blind match is created</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Your ratings are never shown to the people you rate</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>All matches start anonymous and progress through stages</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deactivate Option */}
        <Card className="border border-gray-300">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 text-gray-900">Deactivate Love Mode</h3>
            <p className="text-sm text-gray-600 mb-3">
              This will pause your Love Mode profile. Your matches and conversations will be saved.
            </p>
            <Button
              variant="outline"
              onClick={onDeactivate}
              className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Pause Love Mode
            </Button>
          </CardContent>
        </Card>

        {/* Bottom Padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
