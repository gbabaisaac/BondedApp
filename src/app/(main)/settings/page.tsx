'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/TopBar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { 
  User, Bell, Lock, Eye, HelpCircle, 
  FileText, LogOut, ChevronRight, Shield, Palette
} from 'lucide-react';

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  description?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5 text-[var(--primary)]" />
    </div>
    <div className="flex-1 min-w-0 text-left">
      <div className="font-semibold text-[var(--text-primary)]">{label}</div>
      {description && (
        <div className="text-sm text-[var(--text-secondary)]">{description}</div>
      )}
    </div>
    <ChevronRight className="h-5 w-5 text-[var(--text-secondary)] flex-shrink-0" />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();

  return (
    <>
      <TopBar title="Settings" showBack={true} showSearch={false} showNotifications={false} />
      
      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Account */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border-light)]">
              <h3 className="font-bold text-[var(--text-primary)]">Account</h3>
            </div>
            <SettingsItem
              icon={User}
              label="Edit Profile"
              description="Update your photos and details"
              onClick={() => router.push('/settings/profile')}
            />
            <div className="border-t border-[var(--border-light)]" />
            <SettingsItem
              icon={Shield}
              label="Bond Print"
              description="Retake personality quiz"
              onClick={() => router.push('/bond-print')}
            />
          </CardContent>
        </Card>
        
        {/* Privacy & Security */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border-light)]">
              <h3 className="font-bold text-[var(--text-primary)]">Privacy & Security</h3>
            </div>
            <SettingsItem
              icon={Lock}
              label="Privacy Settings"
              description="Control who can see your profile"
            />
            <div className="border-t border-[var(--border-light)]" />
            <SettingsItem
              icon={Eye}
              label="Blocked Users"
              description="Manage blocked accounts"
            />
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border-light)]">
              <h3 className="font-bold text-[var(--text-primary)]">Preferences</h3>
            </div>
            <SettingsItem
              icon={Bell}
              label="Notifications"
              description="Manage notification settings"
            />
            <div className="border-t border-[var(--border-light)]" />
            <SettingsItem
              icon={Palette}
              label="Appearance"
              description="Theme and display options"
            />
          </CardContent>
        </Card>
        
        {/* Support */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border-light)]">
              <h3 className="font-bold text-[var(--text-primary)]">Support & About</h3>
            </div>
            <SettingsItem
              icon={HelpCircle}
              label="Help Center"
              description="Get help and support"
            />
            <div className="border-t border-[var(--border-light)]" />
            <SettingsItem
              icon={FileText}
              label="Terms & Privacy"
              description="Read our policies"
            />
          </CardContent>
        </Card>
        
        {/* Logout */}
        <Button 
          variant="danger" 
          size="lg" 
          fullWidth
          onClick={() => {/* TODO: Handle logout */}}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
        
        <p className="text-center text-sm text-[var(--text-tertiary)] py-4">
          Bonded v1.0.0
        </p>
      </main>
    </>
  );
}

