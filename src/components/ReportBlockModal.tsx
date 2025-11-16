import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Flag, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { apiPost } from '../utils/api-client';

interface ReportBlockModalProps {
  userId: string;
  userName: string;
  accessToken: string;
  open: boolean;
  onClose: () => void;
  onBlock?: () => void;
}

export function ReportBlockModal({ 
  userId, 
  userName, 
  accessToken, 
  open, 
  onClose,
  onBlock 
}: ReportBlockModalProps) {
  const [action, setAction] = useState<'report' | 'block' | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      await apiPost(
        `/user/${userId}/report`,
        { reason: reportReason, details: reportDetails },
        accessToken
      );
      toast.success('Report submitted. We will review it shortly.');
      onClose();
      setAction(null);
      setReportReason('');
      setReportDetails('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      await apiPost(`/user/${userId}/block`, {}, accessToken);
      toast.success(`${userName} has been blocked`);
      onBlock?.();
      onClose();
      setAction(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report or Block {userName}</DialogTitle>
          <DialogDescription>
            Help us keep Bonded safe and respectful
          </DialogDescription>
        </DialogHeader>

        {!action ? (
          <div className="space-y-3">
            <Button
              onClick={() => setAction('report')}
              variant="outline"
              className="w-full justify-start"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report User
            </Button>
            <Button
              onClick={() => setAction('block')}
              variant="outline"
              className="w-full justify-start"
            >
              <UserX className="w-4 h-4 mr-2" />
              Block User
            </Button>
          </div>
        ) : action === 'report' ? (
          <div className="space-y-4">
            <div>
              <Label>Reason for reporting</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate" className="font-normal">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment" className="font-normal">Harassment or bullying</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam" className="font-normal">Spam or fake profile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Tell us more about what happened..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleReport}
                disabled={loading || !reportReason}
                className="flex-1 bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white"
              >
                Submit Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#2E7B9115] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#2E7B91] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#1E4F74] font-medium mb-1">What happens when you block someone?</p>
                  <ul className="text-xs text-[#475569] space-y-1 list-disc list-inside">
                    <li>They won't be able to message you</li>
                    <li>They won't appear in your Discover feed</li>
                    <li>You won't appear in their Discover feed</li>
                    <li>You can unblock them anytime in settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAction(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Block {userName}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



