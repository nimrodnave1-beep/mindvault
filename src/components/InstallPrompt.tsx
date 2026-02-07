'use client';

import { useState, useEffect } from 'react';
import { X, Share, Plus, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = new Date(dismissed).getTime();
      const now = new Date().getTime();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (now - dismissedTime < threeDays) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (ios && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 animate-slide-up">
      <div className="card-premium p-4 shadow-lg border border-purple-100">
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">MV</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">התקן את MindVault</h3>
            {isIOS ? (
              <p className="text-sm text-gray-500">
                לחץ על{' '}
                <Share className="w-4 h-4 inline-block mx-1" />
                ואז על{' '}
                <span className="inline-flex items-center gap-1 font-medium">
                  &quot;הוסף למסך הבית&quot;
                  <Plus className="w-4 h-4" />
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                גישה מהירה מהמסך הראשי, עובד גם אופליין
              </p>
            )}
          </div>
        </div>

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-4 btn-primary py-3 gap-2"
          >
            <Download className="w-5 h-5" />
            התקן עכשיו
          </button>
        )}
      </div>
    </div>
  );
}
