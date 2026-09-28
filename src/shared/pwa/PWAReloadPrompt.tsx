import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_swUrl, r) {
            if (r) {
                // Check periodically for updates (every hour)
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.warn('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xl flex items-center justify-between gap-3 text-neutral-900 dark:text-neutral-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
                        {needRefresh ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div className="text-xs">
                        <div className="font-semibold">
                            {needRefresh ? 'Pembaruan Tersedia' : 'Siap Digunakan Offline'}
                        </div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-3xs mt-0.5">
                            {needRefresh
                                ? 'Muat ulang untuk menerapkan pembaruan terbaru.'
                                : 'Aplikasi telah tersimpan untuk akses offline.'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {needRefresh && (
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                            Perbarui
                        </button>
                    )}
                    <button
                        onClick={close}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                        title="Tutup"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
