import React from 'react';
import { Card } from './ui/card';

interface BondRevealReportProps {
  relationshipId?: string;
  relationship?: any;
  userProfile?: any;
  partnerProfile?: any;
  accessToken?: string;
  onBack?: () => void;
  onContinueChat?: () => void;
}

export function BondRevealReport({ relationshipId, onBack }: BondRevealReportProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card style={{ maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          🎉 Bond Reveal
        </h2>
        <p style={{ color: '#666' }}>
          Coming soon...
        </p>
      </Card>
    </div>
  );
}
