import { Users, MessageCircle, Search, UserX, Inbox } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type: 'no-connections' | 'no-messages' | 'no-profiles' | 'no-matches' | 'no-chats';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  const configs = {
    'no-connections': {
      icon: Users,
      defaultTitle: 'No connections yet',
      defaultDescription: 'Start exploring to find people you\'d like to connect with!',
      defaultAction: 'Discover People',
      color: 'text-[#2E7B91]',
      bgColor: 'bg-[#2E7B9115]',
    },
    'no-messages': {
      icon: MessageCircle,
      defaultTitle: 'No messages yet',
      defaultDescription: 'Start a conversation with someone you\'ve connected with!',
      defaultAction: 'View Connections',
      color: 'text-[#2E7B91]',
      bgColor: 'bg-[#2E7B9115]',
    },
    'no-profiles': {
      icon: Search,
      defaultTitle: 'No profiles found',
      defaultDescription: 'Try adjusting your filters or search terms.',
      defaultAction: 'Clear Filters',
      color: 'text-[#64748b]',
      bgColor: 'bg-[#EAEAEA]',
    },
    'no-matches': {
      icon: UserX,
      defaultTitle: 'No matches found',
      defaultDescription: 'Keep exploring! New people join every day.',
      defaultAction: 'Keep Exploring',
      color: 'text-[#64748b]',
      bgColor: 'bg-[#EAEAEA]',
    },
    'no-chats': {
      icon: Inbox,
      defaultTitle: 'No chats yet',
      defaultDescription: 'Your conversations will appear here once you start messaging.',
      defaultAction: 'Find People',
      color: 'text-[#2E7B91]',
      bgColor: 'bg-[#2E7B9115]',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.color}`} />
      </div>
      <h3 className="text-lg font-semibold text-[#1E4F74] mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-[#475569] mb-6 max-w-sm">
        {description || config.defaultDescription}
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-[#2E7B91] to-[#25658A] hover:from-[#25658A] hover:to-[#1E4F74] text-white"
        >
          {actionLabel || config.defaultAction}
        </Button>
      )}
    </div>
  );
}



