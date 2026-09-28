import type {OutputData} from '@editorjs/editorjs';

export interface Note {
    id: number;
    user_id: number;
    title: string | null;
    content: OutputData | null;
    created_at: string;
    updated_at: string;
}