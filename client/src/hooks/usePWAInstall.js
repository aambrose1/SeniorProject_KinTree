import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA install prompt
 * Returns deferredPrompt and functions to show/dismiss install prompt
 * 
 * Usage:
 * const { installPrompt, showInstallPrompt, dismissPrompt } = usePWAInstall();
 * 
 * return (
 *   installPrompt && (
 *     <div>
 *       <p>Install KinTree as an app!</p>
 *       <button onClick={showInstallPrompt}>Install</button>
 *       <button onClick={dismissPrompt}>Dismiss</button>
 *     </div>
 *   )
 * );
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event for later use
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('KinTree installed as PWA');
      setInstallPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  return {
    installPrompt: showPrompt ? installPrompt : null,
    showInstallPrompt,
    dismissPrompt,
    isPromptVisible: showPrompt,
  };
}
