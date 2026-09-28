import React, { useEffect, useRef, useState, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Checklist from '@editorjs/checklist';
import InlineCode from '@editorjs/inline-code';

import api from '../../../shared/services/api';
import type { Note } from '../types/note.types';

interface NoteEditorProps {
    note: Note;
    onNoteUpdated: (updatedNote: Note) => void;
    onDeleteNote?: (noteId: number) => void;
    onBackToLibrary?: () => void;
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
    note,
    onNoteUpdated,
    onDeleteNote,
    onBackToLibrary,
    isSidebarCollapsed = false,
    onToggleSidebar,
}) => {
    const [title, setTitle] = useState(note.title || '');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [lastSavedTime, setLastSavedTime] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const editorInstance = useRef<EditorJS | null>(null);
    const titleRef = useRef(title);

    // Sinkronisasi referensi judul saat input diketik
    useEffect(() => {
        titleRef.current = title;
    }, [title]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    /**
     * Fungsi Simpan Manual (Hanya berjalan saat tombol Simpan ditekan atau shortcut Ctrl+S)
     */
    const handleSave = useCallback(async () => {
        if (!editorInstance.current || isSaving) return;

        setIsSaving(true);
        try {
            const data = await editorInstance.current.save();
            const response = await api.put<Note>(`/notes/${note.id}`, {
                title: titleRef.current,
                content: data,
            });

            setHasUnsavedChanges(false);
            const now = new Date();
            setLastSavedTime(
                now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            );
            onNoteUpdated(response.data);
            showToast('Catatan berhasil disimpan');
        } catch (error) {
            console.error('Gagal menyimpan catatan:', error);
            showToast('Gagal menyimpan catatan ke server.');
        } finally {
            setIsSaving(false);
        }
    }, [note.id, onNoteUpdated, isSaving]);

    // Listener shortcut keyboard Ctrl+S / Cmd+S untuk simpan cepat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    // Inisialisasi EditorJS saat komponen dimount (dikelola oleh key={note.id})
    useEffect(() => {
        const editor = new EditorJS({
            holder: 'editorjs-container',
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: ['link', 'inlineCode'],
                    config: {
                        placeholder: 'Heading...',
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2,
                    },
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered',
                    },
                },
                checklist: {
                    class: Checklist,
                    inlineToolbar: true,
                },
                table: {
                    class: Table,
                    inlineToolbar: true,
                    config: {
                        rows: 2,
                        cols: 3,
                    },
                },
                code: {
                    class: CodeTool,
                    inlineToolbar: true,
                    config: {
                        placeholder: 'Tulis kode atau shortcode </> di sini...',
                    },
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Tulis kutipan...',
                        captionPlaceholder: 'Sumber kutipan...',
                    },
                },
                delimiter: Delimiter,
                inlineCode: {
                    class: InlineCode,
                    shortcut: 'CMD+SHIFT+M',
                },
            },
            data: note.content || { blocks: [] },
            placeholder: 'Tulis isi catatan di sini... Tekan TAB atau klik (+) untuk opsi tabel, blok kode </>, to-do, dll.',
            onChange: async () => {
                setHasUnsavedChanges(true);
            },
            onReady: async () => {
            },
        });

        editorInstance.current = editor;

        return () => {
            if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setHasUnsavedChanges(true);
    };

    return (
        <div className="flex-1 flex flex-col h-dvh overflow-hidden bg-white dark:bg-[#191919] transition-colors duration-150 min-w-0">
            {/* Notion Topbar (Breadcrumbs & Actions) */}
            <div className="h-12 px-3 sm:px-6 md:px-8 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between bg-white/80 dark:bg-[#191919]/80 backdrop-blur-xs sticky top-0 z-20 select-none gap-2 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0">
                    {/* Tombol Menu Sidebar (Hamburger di mobile, expand di desktop saat collapsed) */}
                    {onToggleSidebar && (
                        <button
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

                    {/* Notion Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
                        {onBackToLibrary ? (
                            <button
                                onClick={onBackToLibrary}
                                title="Kembali ke Library"
                                className="hover:text-neutral-800 dark:hover:text-neutral-200 transition cursor-pointer flex items-center gap-1 font-medium shrink-0"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">Library</span>
                            </button>
                        ) : (
                            <span className="hover:text-neutral-800 dark:hover:text-neutral-200 transition font-medium shrink-0 hidden sm:inline">
                                Library
                            </span>
                        )}
                        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">/</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">
                            {title.trim() || 'Untitled'}
                        </span>
                    </div>
                </div>

                {/* Topbar Right Actions */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {/* Indikator Status Simpan */}
                    <div className="text-3xs sm:text-xs font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 shrink-0">
                        {isSaving ? (
                            <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="hidden sm:inline">Menyimpan...</span>
                            </span>
                        ) : hasUnsavedChanges ? (
                            <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span className="hidden sm:inline">Belum disimpan</span>
                            </span>
                        ) : (
                            <span className="hidden md:inline">
                                Tersimpan {lastSavedTime ? `pukul ${lastSavedTime}` : ''}
                            </span>
                        )}
                    </div>

                    <span className="text-neutral-300 dark:text-neutral-700 hidden md:inline">•</span>
                    {/* Tombol Simpan Manual */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        title="Simpan Catatan (Ctrl+S)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer shrink-0 disabled:cursor-not-allowed ${
                            hasUnsavedChanges
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-2xs'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 opacity-60'
                        }`}
                    >
                        {isSaving ? (
                            <svg className="animate-spin w-3 h-3 text-current" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        )}
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>

                    {/* Tombol Hapus */}
                    {onDeleteNote && (
                        <button
                            onClick={() => {
                                if (window.confirm('Hapus halaman ini? Tindakan ini tidak dapat dibatalkan.')) {
                                    onDeleteNote(note.id);
                                }
                            }}
                            title="Hapus Halaman"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition cursor-pointer shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Document Canvas (Center Page) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-14 lg:px-24 py-6 sm:py-10">
                <div className="max-w-3xl w-full mx-auto">
                    {/* Notion-style Page Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled"
                        className="w-full text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 bg-transparent border-none outline-none mb-4 sm:mb-6 placeholder-neutral-300 dark:placeholder-neutral-700 focus:placeholder-neutral-400 dark:focus:placeholder-neutral-600 transition"
                    />

                    {/* Canvas EditorJS */}
                    <div id="editorjs-container" className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200" />
                </div>
            </div>

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 py-2 rounded-lg shadow-lg border border-neutral-800 dark:border-neutral-200 flex items-center justify-center sm:justify-start gap-2 text-xs font-medium">
                    <svg className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
