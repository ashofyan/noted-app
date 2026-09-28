import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../app/providers/AuthProvider';

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [generalError, setGeneralError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);
        setFieldErrors({});

        if (password !== passwordConfirmation) {
            setFieldErrors({ password_confirmation: ['Konfirmasi kata sandi tidak cocok.'] });
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 422) {
                    setFieldErrors(error.response.data.errors || {});
                } else {
                    setGeneralError(error.response.data.message || 'Pendaftaran gagal. Silakan coba lagi.');
                }
            } else {
                setGeneralError('Gagal terhubung ke server backend.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[440px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-none p-5 sm:p-8 transition-colors duration-150">
            <div className="mb-5 sm:mb-6 text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 mb-2.5 sm:mb-3 shadow-2xs">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Buat Akun Baru</h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">Daftar sekarang untuk mulai menulis catatan</p>
            </div>

            {generalError && (
                <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="leading-snug">{generalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm rounded-xl focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-4 transition-all duration-150 ${
                                fieldErrors.name
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                    : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 focus:ring-neutral-500/10'
                            }`}
                        />
                    </div>
                    {fieldErrors.name && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.name[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Alamat Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm rounded-xl focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-4 transition-all duration-150 ${
                                fieldErrors.email
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                    : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 focus:ring-neutral-500/10'
                            }`}
                        />
                    </div>
                    {fieldErrors.email && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm rounded-xl focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-4 transition-all duration-150 ${
                                fieldErrors.password
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                    : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 focus:ring-neutral-500/10'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none cursor-pointer"
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Ulangi kata sandi"
                            className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm rounded-xl focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-4 transition-all duration-150 ${
                                fieldErrors.password_confirmation
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                                    : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 focus:ring-neutral-500/10'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none cursor-pointer"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {fieldErrors.password_confirmation && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password_confirmation[0]}</p>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 dark:text-neutral-900 text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Mendaftarkan...</span>
                            </>
                        ) : (
                            <>
                                <span>Daftar Akun</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Sudah memiliki akun?{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline transition-colors"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
};
