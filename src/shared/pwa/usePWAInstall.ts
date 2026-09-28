import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        return isStandalone || isIosStandalone;
    });

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setIsInstalled(true);
                setIsInstallable(false);
                setDeferredPrompt(null);
                return true;
            }
        } catch (error) {
            console.error('Error during PWA installation:', error);
        }

        return false;
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        installApp,
    };
}
