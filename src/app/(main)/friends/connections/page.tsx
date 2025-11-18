'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Search, UserCheck, MessageCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock connections
const mockConnections = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i}`,
  name: `Friend ${i + 1}`,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  year_level: 'Junior',
  major: 'Computer Science',
  mutual_friends_count: Math.floor(Math.random() * 50),
  is_online: Math.random() > 0.6,
  connected_since: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
}));

const ConnectionCard = ({ connection }: { connection: any }) => {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors">
      {/* Avatar */}
      <Link href={`/profile/${connection.id}`}>
        <div className="relative">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            <Image
              src={connection.avatar_url}
              alt={connection.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          {connection.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--success)] border-2 border-white rounded-full" />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${connection.id}`}>
          <h3 className="font-bold text-[var(--text-primary)] text-base mb-0.5 truncate hover:text-[var(--primary)]">
            {connection.name}
          </h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {connection.major} • {connection.year_level}
        </p>
        {connection.mutual_friends_count > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {connection.mutual_friends_count} mutual friends
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {/* TODO: Open messages */}}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online'>('all');

  const filteredConnections = mockConnections.filter((conn) => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'online' && conn.is_online);
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <TopBar title="My Connections" showBack={true} />

      <main className="container mx-auto">
        {/* Header Stats */}
        <div className="p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockConnections.length}</div>
              <div className="text-sm opacity-90">Connections</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">
                {mockConnections.filter(c => c.is_online).length}
              </div>
              <div className="text-sm opacity-90">Online Now</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="sticky top-16 z-40 bg-white border-b border-[var(--border-light)] p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-[var(--border-light)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({mockConnections.length})
            </Button>
            <Button
              variant={filter === 'online' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('online')}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--success)] rounded-full" />
                Online ({mockConnections.filter(c => c.is_online).length})
              </span>
            </Button>
          </div>
        </div>

        {/* Connections List */}
        <Card className="mt-4 overflow-hidden">
          {filteredConnections.length > 0 ? (
            <div className="divide-y divide-[var(--border-light)]">
              {filteredConnections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <UserCheck className="h-16 w-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No connections found
              </h3>
              <p className="text-[var(--text-secondary)]">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

