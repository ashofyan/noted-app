import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Memverifikasi sesi...
            </div>
        );
    }

    if (!isAuthenticated) {
        // Simpan lokasi saat ini agar setelah login bisa diarahkan kembali ke halaman ini
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};