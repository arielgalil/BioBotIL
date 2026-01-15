import { useState, useEffect } from 'react';

// Global variable to persist state across re-mounts in development
let globalInstallPrompt: any = null;
let globalIsInstallable = false;

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(globalInstallPrompt);
  const [isInstallable, setIsInstallable] = useState(globalIsInstallable);

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost';
    
    // For debugging: Force show button on localhost after 3 seconds
    const timer = setTimeout(() => {
      if (isLocal && !globalIsInstallable) {
        console.log('PWA: Debug - Forcing installable state');
        globalIsInstallable = true;
        setIsInstallable(true);
      }
    }, 3000);

    const handler = (e: any) => {
      console.log('PWA: beforeinstallprompt event fired!');
      clearTimeout(timer);
      e.preventDefault();
      globalInstallPrompt = e;
      globalIsInstallable = true;
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = installPrompt || globalInstallPrompt;
    if (!promptToUse) {
      alert("Note: This is a debug button. In a real scenario, the browser handles the actual installation prompt here.");
      return;
    }

    promptToUse.prompt();
    const { outcome } = await promptToUse.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA: User accepted install');
      globalIsInstallable = false;
      globalInstallPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, handleInstallClick };
}