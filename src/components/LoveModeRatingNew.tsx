import React from 'react';
import { Card } from './ui/card';

interface LoveModeRatingNewProps {
  onComplete?: () => void;
}

export function LoveModeRatingNew({ onComplete }: LoveModeRatingNewProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card style={{ maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          ⭐ Rating Feature
        </h2>
        <p style={{ color: '#666' }}>
          Coming soon...
        </p>
      </Card>
    </div>
  );
}
