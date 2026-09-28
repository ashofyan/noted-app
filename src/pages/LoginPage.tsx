import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    return (
        <div className="min-h-dvh flex flex-col justify-between items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-6 sm:py-8 relative overflow-x-hidden select-none transition-colors duration-150">
            {/* Ambient Background Decorative Gradients - Monochrome */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute -top-24 left-1/4 w-96 h-96 bg-neutral-200 dark:bg-neutral-800 rounded-full blur-3xl" />
                <div className="absolute -top-20 right-1/4 w-80 h-80 bg-neutral-300/50 dark:bg-neutral-700/30 rounded-full blur-3xl" />
            </div>

            {/* Top Brand Header */}
            <header className="relative z-10 pt-2 pb-4 text-center shrink-0">
                <Link to="/login" className="inline-flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 shadow-sm group-hover:scale-105 transition-transform duration-150">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Noted<span className="text-neutral-500">.</span>
                    </span>
                </Link>
            </header>

            {/* Auth Form Center */}
            <main className="relative z-10 w-full flex justify-center py-2">
                <LoginForm onSuccess={() => navigate(from, { replace: true })} />
            </main>

            {/* Minimalist Footer */}
            <footer className="relative z-10 pt-6 pb-2 text-center text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                <p>&copy; {new Date().getFullYear()} Noted App &bull; Ruang sederhana untuk ide dan catatanmu.</p>
            </footer>
        </div>
    );
};
