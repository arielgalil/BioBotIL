import { useState, useEffect } from 'react';

// Global variable to persist state across re-mounts
let globalInstallPrompt: any = null;
let globalIsInstallable = false;

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(globalInstallPrompt);
  const [isInstallable, setIsInstallable] = useState(globalIsInstallable);

  useEffect(() => {
    // If already in standalone mode, we are installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      globalIsInstallable = false;
      setIsInstallable(false);
      return;
    }

    const handler = (e: any) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      globalInstallPrompt = e;
      globalIsInstallable = true;
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      globalIsInstallable = false;
      globalInstallPrompt = null;
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = installPrompt || globalInstallPrompt;
    if (!promptToUse) return;

    promptToUse.prompt();
    const { outcome } = await promptToUse.userChoice;
    
    if (outcome === 'accepted') {
      globalIsInstallable = false;
      globalInstallPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, handleInstallClick };
}
