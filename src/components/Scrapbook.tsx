/**
 * Scrapbook Component
 * Dating mode with Bonded Stages progression
 * Wrapper around LoveModeNew to match spec naming
 */

import React, { Suspense, lazy } from 'react';

const LoveModeNew = lazy(() => import('./LoveModeNew').then(m => ({ default: m.LoveModeNew })));

interface ScrapbookProps {
  onExit: () => void;
}

export function Scrapbook({ onExit }: ScrapbookProps) {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Loading dating mode...</p>
      </div>
    }>
      <LoveModeNew onExit={onExit} />
    </Suspense>
  );
}

