export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    register: (payload: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser?: (user: User) => void;
}
