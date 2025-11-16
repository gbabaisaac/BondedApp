/**
 * Offline detection and network status utilities
 */

export function isOnline(): boolean {
  return navigator.onLine;
}

export function addOnlineListener(callback: () => void): () => void {
  const handleOnline = () => callback();
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}

export function addOfflineListener(callback: () => void): () => void {
  const handleOffline = () => callback();
  window.addEventListener('offline', handleOffline);
  return () => window.removeEventListener('offline', handleOffline);
}

export function addNetworkStatusListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const cleanupOnline = addOnlineListener(onOnline);
  const cleanupOffline = addOfflineListener(onOffline);
  return () => {
    cleanupOnline();
    cleanupOffline();
  };
}




