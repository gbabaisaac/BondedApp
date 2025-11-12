import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { addNetworkStatusListener } from '../utils/offline';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const cleanup = addNetworkStatusListener(
      () => {
        setIsOnline(true);
        if (wasOffline) {
          toast.success('Back online!');
          setWasOffline(false);
        }
      },
      () => {
        setIsOnline(false);
        setWasOffline(true);
        toast.error('No internet connection');
      }
    );

    return cleanup;
  }, [wasOffline]);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 z-[100] flex items-center gap-2 justify-center text-sm">
      <WifiOff className="w-4 h-4" />
      <span>No internet connection</span>
    </div>
  );
}


