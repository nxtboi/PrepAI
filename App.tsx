
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Dashboard from './pages/Dashboard';
import QBankGenerator from './pages/QBankGenerator';
import DoubtSolver from './pages/DoubtSolver';
import TopicNotes from './pages/TopicNotes';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Import Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PasswordReset from './components/auth/PasswordReset';

// Import Layout
import MainLayout from './components/layout/MainLayout';
import { User } from './types';

const App: React.FC = () => {
    // A simple mock for auth state. In a real app, use Context or a state management library.
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock checking for a logged-in user from localStorage
        const storedUser = localStorage.getItem('prep-ai-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (loggedInUser: User) => {
        localStorage.setItem('prep-ai-user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('prep-ai-user');
        setUser(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <HashRouter>
            <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </HashRouter>
    );
};

interface AppRoutesProps {
    user: User | null;
    onLogin: (user: User) => void;
    onLogout: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ user, onLogin, onLogout }) => {
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={onLogin} />} />
                <Route path="/signup" element={<Signup onLogin={onLogin} />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route element={<MainLayout user={user} onLogout={onLogout} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard user={user} />} />
                <Route path="q-bank-generator" element={<QBankGenerator />} />
                <Route path="doubt-solver" element={<DoubtSolver />} />
                <Route path="topic-notes" element={<TopicNotes />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile user={user} />} />
                {user.isAdmin && <Route path="admin" element={<Admin />} />}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
        </Routes>
    );
};

export default App;
