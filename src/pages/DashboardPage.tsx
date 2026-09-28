import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../shared/services/api';
import type { Note } from '../features/notes/types/note.types';
import { NoteSidebar } from '../features/notes/components/NoteSidebar';
import { NoteEditor } from '../features/notes/components/NoteEditor';
import { NoteLibrary } from '../features/notes/components/NoteLibrary';

export const DashboardPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    // Di mobile (< 768px), sidebar default tertutup agar pengguna langsung melihat konten
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });

    // Ambil semua catatan saat pertama kali workspace dibuka
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get<Note[]>('/notes');
                const fetchedNotes = response.data || [];
                setNotes(fetchedNotes);
            } catch (error) {
                console.error('Gagal mengambil daftar catatan:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    // Tentukan catatan yang sedang aktif berdasarkan ID di URL (jika ada)
    const selectedNote = useMemo(() => {
        if (!id || !notes.length) return null;
        return notes.find((n) => n.id === Number(id)) || null;
    }, [notes, id]);

    // Handler memilih catatan dari sidebar atau library
    const handleSelectNote = (note: Note) => {
        navigate(`/notes/${note.id}`);
    };

    // Handler kembali ke library catatan
    const handleSelectLibrary = () => {
        navigate('/');
    };

    // Handler membuat catatan baru (Notion: New Page)
    const handleCreateNote = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const response = await api.post<Note>('/notes', {
                title: '',
                content: { blocks: [] },
            });
            const newNote = response.data;
            setNotes((prev) => [newNote, ...prev]);
            navigate(`/notes/${newNote.id}`);
        } catch (error) {
            console.error('Gagal membuat catatan baru:', error);
            alert('Gagal membuat catatan baru ke server.');
        } finally {
            setIsCreating(false);
        }
    };

    // Handler update catatan saat disimpan di editor
    const handleNoteUpdated = useCallback((updatedNote: Note) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        );
    }, []);

    // Handler menghapus catatan
    const handleDeleteNote = async (noteId: number) => {
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));

            // Jika sedang membuka catatan yang dihapus di editor, arahkan kembali ke library
            if (id && Number(id) === noteId) {
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error('Gagal menghapus catatan:', error);
            alert('Gagal menghapus catatan dari server.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center bg-white dark:bg-[#191919] text-neutral-400 gap-2.5 p-4">
                <svg className="animate-spin w-5 h-5 text-neutral-800 dark:text-neutral-200" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs">Memuat library workspace...</span>
            </div>
        );
    }

    // Jika user mengakses URL /notes/:id tertentu tetapi id tersebut tidak ditemukan
    if (id && !selectedNote) {
        return (
            <div className="flex h-dvh w-full overflow-hidden bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 antialiased font-sans">
                <NoteSidebar
                    notes={notes}
                    selectedNoteId={null}
                    onSelectNote={handleSelectNote}
                    onSelectLibrary={handleSelectLibrary}
                    onCreateNote={handleCreateNote}
                    onDeleteNote={handleDeleteNote}
                    isCreating={isCreating}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div className="flex-1 flex flex-col h-dvh overflow-hidden min-w-0">
                    {/* Topbar dengan hamburger button untuk membuka sidebar */}
                    <div className="h-12 px-4 sm:px-8 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center bg-white/80 dark:bg-[#191919]/80 backdrop-blur-xs shrink-0">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title="Menu Catatan"
                            className={`p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer mr-2 ${
                                isSidebarCollapsed ? 'inline-flex' : 'inline-flex md:hidden'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span className="text-xs text-neutral-400">Noted</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-[#fafafa] dark:bg-[#151515] select-none overflow-y-auto">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                            Catatan Tidak Ditemukan
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 max-w-xs">
                            Catatan yang Anda coba buka mungkin telah dihapus atau tautan tidak valid.
                        </p>
                        <button
                            onClick={handleSelectLibrary}
                            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer"
                        >
                            Kembali ke Library Catatan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 antialiased font-sans">
            {/* Notion Sidebar Kiri (Off-canvas drawer di mobile, docked di desktop) */}
            <NoteSidebar
                notes={notes}
                selectedNoteId={selectedNote?.id || null}
                onSelectNote={handleSelectNote}
                onSelectLibrary={handleSelectLibrary}
                onCreateNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
                isCreating={isCreating}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Notion Main Area: Tampilan Editor jika sedang membuka catatan, atau Tampilan Landing Library jika di root */}
            {selectedNote ? (
                <NoteEditor
                    key={selectedNote.id}
                    note={selectedNote}
                    onNoteUpdated={handleNoteUpdated}
                    onDeleteNote={handleDeleteNote}
                    onBackToLibrary={handleSelectLibrary}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            ) : (
                <NoteLibrary
                    notes={notes}
                    onSelectNote={handleSelectNote}
                    onCreateNote={handleCreateNote}
                    onDeleteNote={handleDeleteNote}
                    isCreating={isCreating}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            )}
        </div>
    );
};
