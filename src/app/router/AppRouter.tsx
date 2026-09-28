import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { RegisterPage } from '../../pages/RegisterPage';

export const router = createBrowserRouter([
    // Guest Routes (Public khusus pengunjung yang belum login)
    {
        element: <GuestRoute />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },

    // Protected Routes (Harus terotentikasi)
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <DashboardPage />,
            },
            {
                path: '/library',
                element: <Navigate to="/" replace />,
            },
            {
                path: '/dashboard',
                element: <Navigate to="/" replace />,
            },
            {
                path: '/notes/:id',
                element: <DashboardPage />,
            },
        ],
    },

    // Fallback 404 / Catch-all
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
