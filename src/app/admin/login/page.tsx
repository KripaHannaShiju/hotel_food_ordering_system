
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    // Form field states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // Error state for UI feedback on failed login attempts
    const [error, setError] = useState('');
    const router = useRouter();

    /**
     * Handles the admin login submission.
     * Communicates with the /api/admin/login endpoint and redirects on success.
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, portal: 'admin' }),
            });

            if (res.ok) {
                // Redirecting to the secure admin dashboard upon valid credentials
                router.replace('/admin/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during verification');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--warm-ivory)]">
            <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl border-t-8 border-[var(--deep-burgundy)]">
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-[var(--warm-ivory)] text-4xl mb-2">🔐</div>
                    <h2 className="text-3xl font-black text-[var(--deep-burgundy)]">Admin Access</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Please verify your identity</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100 italic">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest mb-2">Admin Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[var(--deep-burgundy)] focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[var(--deep-burgundy)] focus:bg-white focus:outline-none transition-all font-medium text-gray-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--deep-burgundy)] to-[var(--charcoal)] px-6 py-4 text-white font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        UNIFY ACCESS
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">
                            SECURE INTERNAL PORTAL
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
