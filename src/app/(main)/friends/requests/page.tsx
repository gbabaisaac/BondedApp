'use client';

import React from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock connection requests
const mockRequests = Array.from({ length: 5 }, (_, i) => ({
  id: `request-${i}`,
  requester: {
    id: `user-${i}`,
    name: `User ${i + 1}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    year_level: 'Junior',
    major: 'Computer Science',
  },
  mutual_friends_count: Math.floor(Math.random() * 20),
  created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
}));

const RequestCard = ({ request }: { request: any }) => {
  const [status, setStatus] = React.useState<'pending' | 'accepted' | 'rejected'>('pending');

  if (status !== 'pending') return null;

  return (
    <div className="flex items-center gap-3 p-4">
      {/* Avatar */}
      <Link href={`/profile/${request.requester.id}`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
          <Image
            src={request.requester.avatar_url}
            alt={request.requester.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${request.requester.id}`}>
          <h3 className="font-bold text-[var(--text-primary)] text-base mb-0.5 truncate hover:text-[var(--primary)]">
            {request.requester.name}
          </h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {request.requester.major} • {request.requester.year_level}
        </p>
        {request.mutual_friends_count > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {request.mutual_friends_count} mutual friends
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          onClick={() => {
            setStatus('accepted');
            // TODO: API call
          }}
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setStatus('rejected');
            // TODO: API call
          }}
        >
          <X className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    </div>
  );
};

export default function ConnectionRequestsPage() {
  const [requests, setRequests] = React.useState(mockRequests);

  return (
    <>
      <TopBar title="Connection Requests" showBack={true} />

      <main className="container mx-auto px-4 py-6">
        {requests.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-[var(--border-light)]">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">✋</div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              No Pending Requests
            </h3>
            <p className="text-[var(--text-secondary)]">
              You're all caught up!
            </p>
          </Card>
        )}
      </main>
    </>
  );
}

