import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface LoveModeOnboardingProps {
  onComplete?: () => void;
  onActivate?: () => void;
}

export function LoveModeOnboarding({ onComplete, onActivate }: LoveModeOnboardingProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card style={{ maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          💕 Dating Mode
        </h2>
        <p style={{ marginBottom: '24px', color: '#666' }}>
          Welcome to dating mode! This feature is coming soon.
        </p>
        <Button onClick={onActivate || onComplete}>
          Continue
        </Button>
      </Card>
    </div>
  );
}
