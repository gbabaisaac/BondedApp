import React from 'react';
import { Card } from './ui/card';

interface LovePrintQuizNewProps {
  onComplete?: (data: any) => void;
  onSkip?: () => void;
}

export function LovePrintQuizNew({ onComplete, onSkip }: LovePrintQuizNewProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card style={{ maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          💕 Love Print Quiz
        </h2>
        <p style={{ color: '#666' }}>
          Coming soon...
        </p>
      </Card>
    </div>
  );
}
