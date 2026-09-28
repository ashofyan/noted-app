import React, { useEffect, useState } from 'react';
import api from '../../shared/services/api';
import type { User } from '../../features/auth/types/auth.types';
import { AuthContext } from '../../shared/context/AuthContext';

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from '../../shared/context/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Verifikasi token yang ada saat aplikasi pertama kali dimuat
    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get<{ user: User }>('/me');
                setUser(response.data.user);
            } catch (error) {
                console.error('Sesi kedaluwarsa atau token tidak valid', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const register = async (payload: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => {
        const response = await api.post<{ user: User; token: string }>('/register', payload);
        const { token: receivedToken, user: receivedUser } = response.data;

        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
    };

    const login = async (credentials: { email: string; password: string }) => {
        const response = await api.post<{ user: User; token: string }>('/login', credentials);
        const { token: receivedToken, user: receivedUser } = response.data;

        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                register,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
