import React from 'react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
    className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
    const { isInstallable, isInstalled, installApp } = usePWAInstall();

    if (!isInstallable || isInstalled) {
        return null;
    }

    return (
        <button
            onClick={installApp}
            title="Pasang Noted sebagai Aplikasi (PWA)"
            className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition cursor-pointer text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white ${className}`}
        >
            <div className="w-4 h-4 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </div>
            <span>Pasang Aplikasi</span>
        </button>
    );
};
