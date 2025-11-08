import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DebugPanelProps {
  appState: string;
  hasToken: boolean;
  hasProfile: boolean;
}

export function DebugPanel({ appState, hasToken, hasProfile }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 bg-black/90 text-white border-white/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs">Debug Info</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {isOpen && (
          <CardContent className="text-xs space-y-1 pt-2">
            <div className="flex justify-between">
              <span className="text-white/60">State:</span>
              <span className="font-mono">{appState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Token:</span>
              <span className={hasToken ? 'text-green-400' : 'text-red-400'}>
                {hasToken ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Profile:</span>
              <span className={hasProfile ? 'text-green-400' : 'text-red-400'}>
                {hasProfile ? '✓' : '✗'}
              </span>
            </div>
            <div className="pt-2 border-t border-white/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('App State:', appState);
                  console.log('Has Token:', hasToken);
                  console.log('Has Profile:', hasProfile);
                  console.log('=================');
                }}
                className="w-full h-6 text-xs bg-white/10 hover:bg-white/20 border-white/20"
              >
                Log to Console
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
