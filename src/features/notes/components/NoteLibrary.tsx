import React, { useState, useMemo } from 'react';
import type { Note } from '../types/note.types';
import type { User as UserType } from '../../auth/types/auth.types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { extractNoteSnippet, formatFriendlyDate } from '../utils/noteUtils';
import api from '../../../shared/services/api';
import { Calendar, User, Mail, X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface NoteLibraryProps {
    notes: Note[];
    onSelectNote: (note: Note) => void;
    onCreateNote: () => void;
    onDeleteNote?: (noteId: number) => void;
    isCreating: boolean;
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

type SortOption = 'updated_desc' | 'updated_asc' | 'created_desc' | 'title_asc' | 'title_desc';
type ViewMode = 'grid' | 'list';

export const NoteLibrary: React.FC<NoteLibraryProps> = ({
    notes,
    onSelectNote,
    onCreateNote,
    onDeleteNote,
    isCreating,
    isSidebarCollapsed,
    onToggleSidebar,
}) => {
    const { user, updateUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // State untuk Menu Update Detail User
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

    // Handler buka modal edit profil
    const handleOpenProfileModal = () => {
        setProfileName(user?.name || '');
        setProfileEmail(user?.email || '');
        setProfileError(null);
        setProfileSuccess(null);
        setIsProfileModalOpen(true);
    };

    // Handler submit update detail user (PUT /api/me)
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileName.trim()) {
            setProfileError('Nama tidak boleh kosong');
            return;
        }
        if (!profileEmail.trim()) {
            setProfileError('Email tidak boleh kosong');
            return;
        }

        setIsSavingProfile(true);
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const response = await api.put<{ message: string; user: UserType }>('/me', {
                name: profileName.trim(),
                email: profileEmail.trim(),
            });

            if (response.data?.user && updateUser) {
                updateUser(response.data.user);
            }

            setProfileSuccess(response.data?.message || 'Profil berhasil diperbarui');
            setTimeout(() => {
                setIsProfileModalOpen(false);
                setProfileSuccess(null);
            }, 1200);
        } catch (err: unknown) {
            console.error('Gagal memperbarui profil:', err);
            let errorMsg = 'Gagal memperbarui profil. Silakan coba lagi.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as {
                    response?: {
                        data?: {
                            message?: string;
                            errors?: Record<string, string[]>;
                        };
                    };
                };
                if (axiosError.response?.data?.errors) {
                    const firstErrorKey = Object.keys(axiosError.response.data.errors)[0];
                    if (firstErrorKey && axiosError.response.data.errors[firstErrorKey]?.[0]) {
                        errorMsg = axiosError.response.data.errors[firstErrorKey][0];
                    }
                } else if (axiosError.response?.data?.message) {
                    errorMsg = axiosError.response.data.message;
                }
            }
            setProfileError(errorMsg);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Filter dan Urutkan Catatan
    const filteredAndSortedNotes = useMemo(() => {
        let result = [...notes];

        // Filter berdasarkan pencarian
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((note) => {
                const titleMatch = (note.title || '').toLowerCase().includes(query);
                if (titleMatch) return true;

                const snippet = extractNoteSnippet(note.content, 400).toLowerCase();
                return snippet.includes(query);
            });
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'updated_desc':
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                case 'updated_asc':
                    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                case 'created_desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'title_asc':
                    return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
                case 'title_desc':
                    return (b.title || 'Untitled').localeCompare(a.title || 'Untitled');
                default:
                    return 0;
            }
        });

        return result;
    }, [notes, searchQuery, sortBy]);

    return (
        <div className="flex-1 flex flex-col h-dvh overflow-hidden bg-[#fafafa] dark:bg-[#151515] text-neutral-900 dark:text-neutral-100 transition-colors duration-150 min-w-0">
            {/* Topbar Minimalis */}
            <header className="h-12 px-3 sm:px-6 md:px-8 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between bg-white/80 dark:bg-[#181818]/80 backdrop-blur-xs sticky top-0 z-20 select-none gap-2 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    {/* Tombol Buka Sidebar (Hamburger di mobile, expand di desktop saat collapsed) */}
                    {
                    onToggleSidebar && (                        <button
                            onClick={onToggleSidebar}
                            title="Menu Catatan"
                            className={`p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer shrink-0 ${
                                isSidebarCollapsed ? 'inline-flex' : 'inline-flex md:hidden'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        <span className="inline-flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200 shrink-0">
                            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Library
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">/</span>
                        <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline truncate">Semua Catatan</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Menu Update Detail User */}
                    <button
                        onClick={handleOpenProfileModal}
                        title="Update Detail Profil"
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold rounded-md shadow-2xs transition cursor-pointer shrink-0"
                    >
                        <User className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span className="hidden sm:inline">Edit Profil</span>
                        <span className="sm:hidden">Profil</span>
                    </button>

                    <button
                        onClick={onCreateNote}
                        disabled={isCreating}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-md shadow-2xs transition cursor-pointer disabled:opacity-60 shrink-0"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">{isCreating ? 'Membuat...' : 'Catatan Baru'}</span>
                        <span className="sm:hidden">{isCreating ? '...' : 'Baru'}</span>
                    </button>
                </div>
            </header>

            {/* Konten Utama Library (Scrollable) */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 overscroll-contain">
                <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
                    {/* Hero / Greeting Section */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                {user?.name ? `Library Catatan, ${user.name}` : 'Library Catatan'}
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Kelola, cari, dan temukan semua ide dan catatan Anda di satu tempat.
                            </p>
                        </div>
                        <button
                            onClick={handleOpenProfileModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl shadow-2xs transition cursor-pointer self-start sm:self-auto"
                        >
                            <User className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Edit Profil</span>
                        </button>
                    </div>

                    {/* Toolbar: Search, Sort & View Modes */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari judul atau isi catatan..."
                                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200/50 dark:focus:ring-neutral-800 shadow-2xs transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    title="Hapus pencarian"
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Sort & View Mode Controls */}
                        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 shadow-2xs flex-1 sm:flex-initial">
                                <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="bg-transparent text-xs text-neutral-700 dark:text-neutral-300 font-medium outline-none cursor-pointer w-full sm:w-auto"
                                >
                                    <option value="updated_desc" className="bg-white dark:bg-neutral-900">Terakhir Diubah</option>
                                    <option value="updated_asc" className="bg-white dark:bg-neutral-900">Paling Lama Diubah</option>
                                    <option value="created_desc" className="bg-white dark:bg-neutral-900">Terbaru Dibuat</option>
                                    <option value="title_asc" className="bg-white dark:bg-neutral-900">Judul (A - Z)</option>
                                    <option value="title_desc" className="bg-white dark:bg-neutral-900">Judul (Z - A)</option>
                                </select>
                            </div>

                            {/* View Mode Toggle (Grid / List) */}
                            <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-0.5 shadow-2xs shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    title="Tampilan Kisi"
                                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                                            : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    title="Tampilan Daftar"
                                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                                        viewMode === 'list'
                                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                                            : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Jika Tidak Ada Catatan Sama Sekali */}
                    {notes.length === 0 ? (
                        <div className="py-12 sm:py-16 px-4 text-center select-none bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 flex items-center justify-center mb-4">
                                <svg className="w-7 sm:w-8 h-7 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                Library Masih Kosong
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
                                Anda belum memiliki catatan. Mulai tulis ide, konsep, todo list, atau dokumentasi pertama Anda sekarang.
                            </p>
                            <button
                                onClick={onCreateNote}
                                disabled={isCreating}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>{isCreating ? 'Sedang Membuat...' : 'Buat Catatan Pertama'}</span>
                            </button>
                        </div>
                    ) : filteredAndSortedNotes.length === 0 ? (
                        /* Hasil Pencarian Kosong */
                        <div className="py-12 sm:py-14 text-center select-none bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xs">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                                Catatan Tidak Ditemukan
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-4">
                                Tidak ada catatan yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer"
                            >
                                Reset Kata Kunci
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Tampilan Grid / Kartu */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                            {/* Kartu Cepat Buat Catatan Baru */}
                            <div
                                onClick={onCreateNote}
                                className="group min-h-[160px] sm:min-h-[190px] border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 bg-white/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-900"
                            >
                                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                                    {isCreating ? 'Sedang Membuat...' : 'Catatan Baru'}
                                </span>
                                <span className="text-3xs text-neutral-400 mt-0.5">
                                    Klik untuk mulai menulis
                                </span>
                            </div>

                            {/* Daftar Kartu Catatan */}
                            {filteredAndSortedNotes.map((note) => {
                                const snippet = extractNoteSnippet(note.content, 140);
                                const dateFormatted = formatFriendlyDate(note.updated_at);

                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => onSelectNote(note)}
                                        className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <div>
                                            {/* Card Top: Icon & Date Badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Judul Catatan */}
                                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 line-clamp-1 mb-1.5 sm:mb-2">
                                                {note.title?.trim() || (
                                                    <span className="italic text-neutral-400 dark:text-neutral-500">
                                                        Tanpa Judul
                                                    </span>
                                                )}
                                            </h3>

                                            {/* Preview Cuplikan Teks */}
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                                {snippet}
                                            </p>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-3xs text-neutral-400">
                                            <span className="inline-flex items-center gap-1 text-xs font-medium">
                                                <Calendar className="w-3 h-3 text-neutral-400" />
                                                {dateFormatted}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                {onDeleteNote && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Hapus catatan "${note.title || 'Tanpa Judul'}"?`)) {
                                                                onDeleteNote(note.id);
                                                            }
                                                        }}
                                                        title="Hapus Catatan"
                                                        className="opacity-70 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}

                                                <span className="p-1 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Tampilan List / Tabel */
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs divide-y divide-neutral-100 dark:divide-neutral-800">
                            {filteredAndSortedNotes.map((note) => {
                                const snippet = extractNoteSnippet(note.content, 120);
                                const dateFormatted = formatFriendlyDate(note.updated_at);

                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => onSelectNote(note)}
                                        className="group p-3 sm:p-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-3.5 overflow-hidden flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>

                                            <div className="overflow-hidden flex-1 min-w-0">
                                                <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-700 dark:group-hover:text-white">
                                                    {note.title?.trim() || (
                                                        <span className="italic text-neutral-400 dark:text-neutral-500">
                                                            Tanpa Judul
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                                    {snippet}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-3xs sm:text-xs text-neutral-400">
                                            <span className="font-medium whitespace-nowrap">
                                                {dateFormatted}
                                            </span>

                                            {onDeleteNote && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Hapus catatan "${note.title || 'Tanpa Judul'}"?`)) {
                                                            onDeleteNote(note.id);
                                                        }
                                                    }}
                                                    title="Hapus Catatan"
                                                    className="opacity-70 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}

                                            <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Dialog Update Detail User */}
            {isProfileModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
                    onClick={() => {
                        if (!isSavingProfile) setIsProfileModalOpen(false);
                    }}
                >
                    <div
                        className="w-full max-w-md bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header Modal */}
                        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        Update Detail Profil
                                    </h3>
                                    <p className="text-3xs sm:text-xs text-neutral-500 dark:text-neutral-400">
                                        Perbarui nama dan alamat email akun Anda
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                disabled={isSavingProfile}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
                                aria-label="Tutup modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Modal */}
                        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
                            {/* Pesan Sukses */}
                            {profileSuccess && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                                    <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            {/* Pesan Error */}
                            {profileError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            {/* Input Nama Lengkap */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        disabled={isSavingProfile}
                                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200/50 dark:focus:ring-neutral-800 transition disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Input Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        placeholder="contoh@domain.com"
                                        disabled={isSavingProfile}
                                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200/50 dark:focus:ring-neutral-800 transition disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    disabled={isSavingProfile}
                                    className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-60"
                                >
                                    {isSavingProfile ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Simpan Perubahan</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
