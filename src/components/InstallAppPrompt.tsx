import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed before (don't show again for 7 days)
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    if (isStandaloneMode) {
      // Already installed, don't show
      return;
    }

    // Show prompt if not dismissed recently (or dismissed more than 7 days ago)
    if (!dismissed || daysSinceDismissed > 7) {
      // For iOS, show immediately (they need instructions)
      if (iOS) {
        setShowPrompt(true);
      } else {
        // For Android/Desktop, wait for beforeinstallprompt event
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Track install
        if (window.posthog) {
          window.posthog.capture('pwa_installed', { platform: 'android' });
        }
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-teal-blue/50 shadow-lg bg-gray-900/95 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-blue to-ocean-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-soft-cream text-sm">Install Bonded</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Get the full app experience
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-soft-cream flex-shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-300 mb-2">
                    To install on iPhone/iPad:
                  </p>
                  <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Tap the Share button <span className="font-semibold text-soft-cream">□↑</span> at the bottom</li>
                    <li>Scroll down and tap <span className="font-semibold text-soft-cream">"Add to Home Screen"</span></li>
                    <li>Tap <span className="font-semibold text-soft-cream">"Add"</span> to confirm</li>
                  </ol>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    className="w-full mt-2 bg-teal-blue hover:bg-teal-blue/90 text-white text-xs"
                  >
                    Got it!
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="w-full mt-2 bg-gradient-to-r from-teal-blue to-ocean-blue hover:from-teal-blue/90 hover:to-ocean-blue/90 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

