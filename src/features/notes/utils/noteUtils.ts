import type { OutputData } from '@editorjs/editorjs';

/**
 * Ekstrak ringkasan teks bersih dari blok-blok EditorJS
 */
export function extractNoteSnippet(content: OutputData | null, maxLength = 160): string {
    if (!content || !content.blocks || !Array.isArray(content.blocks) || content.blocks.length === 0) {
        return 'Belum ada konten tulisan...';
    }

    const textPieces: string[] = [];

    for (const block of content.blocks) {
        let text = '';
        if (block.type === 'paragraph' || block.type === 'header') {
            text = block.data?.text || '';
        } else if (block.type === 'quote') {
            text = block.data?.text || '';
        } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
            text = block.data.items.join(' • ');
        } else if (block.type === 'checklist' && Array.isArray(block.data?.items)) {
            text = block.data.items
                .map((item: { text: string; checked?: boolean }) => `${item.checked ? '✓' : '○'} ${item.text}`)
                .join(' ');
        } else if (block.type === 'code') {
            text = block.data?.code || '';
        } else if (block.type === 'table' && Array.isArray(block.data?.content)) {
            text = block.data.content.map((row: string[]) => row.join(' ')).join(' | ');
        }

        // Hapus tag HTML seperti <br>, <b>, <i>, <code>, <a>
        const clean = text
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

        if (clean) {
            textPieces.push(clean);
        }

        // Jika sudah cukup panjang, hentikan loop
        if (textPieces.join(' ').length >= maxLength) {
            break;
        }
    }

    const fullSnippet = textPieces.join(' ').trim();
    if (!fullSnippet) {
        return 'Belum ada konten tulisan...';
    }

    if (fullSnippet.length > maxLength) {
        return `${fullSnippet.slice(0, maxLength)}...`;
    }

    return fullSnippet;
}

/**
 * Format tanggal ramah pengguna (Bahasa Indonesia)
 */
export function formatFriendlyDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Baru saja';
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} menit lalu`;
        }
        if (diffHours < 24 && date.getDate() === now.getDate()) {
            return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (diffDays === 1 || (diffDays < 2 && date.getDate() === now.getDate() - 1)) {
            return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        }

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    } catch {
        return '';
    }
}

/**
 * Hitung jumlah kata dalam catatan
 */
export function countWords(content: OutputData | null): number {
    if (!content || !content.blocks) return 0;
    let words = 0;

    for (const block of content.blocks) {
        let text = '';
        if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
            text = block.data?.text || '';
        } else if (block.type === 'code') {
            text = block.data?.code || '';
        } else if (block.type === 'list' && Array.isArray(block.data?.items)) {
            text = block.data.items.join(' ');
        } else if (block.type === 'checklist' && Array.isArray(block.data?.items)) {
            text = block.data.items.map((i: { text: string }) => i.text).join(' ');
        }

        const clean = text.replace(/<[^>]*>/g, '').trim();
        if (clean) {
            words += clean.split(/\s+/).filter(Boolean).length;
        }
    }

    return words;
}
