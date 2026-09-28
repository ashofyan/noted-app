import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { router } from './router/AppRouter';
import { PWAReloadPrompt } from '../shared/pwa';

export const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
                <PWAReloadPrompt />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
