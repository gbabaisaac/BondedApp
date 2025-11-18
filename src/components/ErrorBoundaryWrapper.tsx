/**
 * Wrapper component to add error boundaries to specific components
 */

import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  name = 'Component'
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}







