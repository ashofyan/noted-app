import React, { useState, useMemo } from 'react';
import type { Note } from '../types/note.types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../shared/context/ThemeContext';
import { PWAInstallButton } from '../../../shared/pwa';

interface NoteSidebarProps {
    notes: Note[];
    selectedNoteId: number | null;
    onSelectNote: (note: Note) => void;
    onSelectLibrary?: () => void;
    onCreateNote: () => void;
    onDeleteNote?: (noteId: number) => void;
    isCreating: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const NoteSidebar: React.FC<NoteSidebarProps> = ({
    notes,
    selectedNoteId,
    onSelectNote,
    onSelectLibrary,
    onCreateNote,
    onDeleteNote,
    isCreating,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter daftar catatan berdasarkan judul atau teks konten
    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return notes;
        const query = searchQuery.toLowerCase();

        return notes.filter((note) => {
            const titleMatch = (note.title || '').toLowerCase().includes(query);
            if (titleMatch) return true;

            const blocks = note.content?.blocks || [];
            return blocks.some((block) => {
                const text = block.data?.text || block.data?.code || '';
                return text.toLowerCase().includes(query);
            });
        });
    }, [notes, searchQuery]);

    // Format tanggal ringkas ala Notion
    const formatNoteDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();

            if (isToday) {
                return date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }

            return date.toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return '';
        }
    };

    // Helper untuk auto-close sidebar di layar mobile setelah user memilih aksi
    const handleMobileSelectNote = (note: Note) => {
        onSelectNote(note);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            onToggleCollapse();
        }
    };

    const handleMobileSelectLibrary = () => {
        if (onSelectLibrary) onSelectLibrary();
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            onToggleCollapse();
        }
    };

    const handleMobileCreateNote = () => {
        onCreateNote();
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            onToggleCollapse();
        }
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {!isCollapsed && (
                <div
                    onClick={onToggleCollapse}
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
                    aria-label="Tutup menu sidebar"
                />
            )}

            <aside
                className={`
                    h-dvh bg-[#fbfbfa] dark:bg-[#191919] border-r border-neutral-200 dark:border-neutral-800/80 flex flex-col select-none transition-all duration-200 ease-in-out
                    fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl
                    md:relative md:shadow-none md:shrink-0
                    ${
                        isCollapsed
                            ? '-translate-x-full md:w-0 md:overflow-hidden md:opacity-0 md:border-none pointer-events-none md:pointer-events-auto'
                            : 'translate-x-0 md:w-64 md:opacity-100'
                    }
                `}
            >
                {/* Top Workspace Header */}
                <div className="h-12 px-3.5 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        {/* Workspace Avatar */}
                        <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {user?.name ? user.name.slice(0, 1).toUpperCase() : 'N'}
                        </div>
                        {/* Workspace Name */}
                        <div className="overflow-hidden">
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate block">
                                {user?.name ? `${user.name}'s Noted` : 'Catatan Saya'}
                            </span>
                        </div>
                    </div>

                    {/* Tombol Tutup Sidebar */}
                    <button
                        onClick={onToggleCollapse}
                        title="Tutup Sidebar"
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition cursor-pointer"
                    >
                        {/* Tampilan icon 'X' di mobile & panah '<<' di desktop */}
                        <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <svg className="w-4 h-4 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Quick Actions (Library, Tambah Catatan, Cari, Install App) */}
                <div className="p-2 space-y-1 shrink-0">
                    {/* Tombol Navigasi Library */}
                    <button
                        onClick={handleMobileSelectLibrary}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md transition cursor-pointer ${
                            selectedNoteId === null
                                ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Library Catatan</span>
                        </div>
                        <span className="text-3xs text-neutral-400 font-mono">
                            {notes.length}
                        </span>
                    </button>

                    {/* Tombol Tambah Halaman Baru */}
                    <button
                        onClick={handleMobileCreateNote}
                        disabled={isCreating}
                        className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white rounded-md transition cursor-pointer disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{isCreating ? 'Membuat...' : 'Catatan Baru'}</span>
                        </div>
                        <span className="text-3xs text-neutral-400 font-mono hidden md:inline">⌘N</span>
                    </button>

                    {/* Tombol Pasang PWA (jika tersedia untuk dipasang) */}
                    <PWAInstallButton className="w-full" />

                    {/* Tombol Cari Cepat */}
                    <div className="relative pt-1">
                        <div className="absolute inset-y-0 left-0 pl-2.5 pt-1 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari catatan..."
                            className="w-full pl-8 pr-6 py-1.5 bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 rounded-md transition outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-2 pt-1 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Section Catatan Saya */}
                <div className="px-3 pt-3 pb-1 flex items-center justify-between text-3xs font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 shrink-0">
                    <span>Catatan Pribadi</span>
                    <button
                        onClick={handleMobileCreateNote}
                        title="Tambah Catatan"
                        className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* List Halaman Catatan */}
                <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 overscroll-contain">
                    {filteredNotes.length === 0 ? (
                        <div className="px-3 py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                            {searchQuery ? 'Tidak ada hasil' : 'Belum ada catatan'}
                        </div>
                    ) : (
                        filteredNotes.map((note) => {
                            const isSelected = selectedNoteId === note.id;

                            return (
                                <div
                                    key={note.id}
                                    onClick={() => handleMobileSelectNote(note)}
                                    className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-1">
                                        <svg className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="truncate">
                                            {note.title?.trim() || 'Untitled'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-3xs text-neutral-400 group-hover:hidden">
                                            {formatNoteDate(note.updated_at)}
                                        </span>

                                        {/* Tombol Hapus (Terlihat di mobile & muncul saat hover di desktop) */}
                                        {onDeleteNote && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Hapus catatan "${note.title || 'Untitled'}"?`)) {
                                                        onDeleteNote(note.id);
                                                    }
                                                }}
                                                title="Hapus Halaman"
                                                className="opacity-70 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700/60 transition cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Footer (User, Dark Mode, Logout) */}
                <div className="p-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden px-1">
                        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-3xs flex items-center justify-center shrink-0">
                            {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                        </div>
                        <span className="text-neutral-700 dark:text-neutral-300 truncate text-xs font-medium">
                            {user?.name || 'Pengguna'}
                        </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                        {/* Toggle Tema */}
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition cursor-pointer"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-3.5 h-3.5 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Tombol Logout */}
                        <button
                            onClick={logout}
                            title="Keluar"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-neutral-800 rounded transition cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
