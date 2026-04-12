
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PasswordReset: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock password reset
        setMessage(`If an account with ${email} exists, a password reset link has been sent.`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Reset Password</h1>
                    <p className="text-slate-500 mt-2">Enter your email to receive a reset link.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">
                    Remember your password?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default PasswordReset;
