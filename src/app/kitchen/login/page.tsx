
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KitchenLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, portal: 'kitchen' }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === 'kitchen') {
                    toast.success('Welcome to the Kitchen!');
                    router.replace('/kitchen/dashboard');
                } else {
                    setError('Unauthorized: You do not have kitchen access');
                    toast.error('Kitchen access denied');
                }
            } else {
                setError(data.error || 'Invalid credentials');
                toast.error('Login failed');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl border-t-8 border-orange-600">
                <div className="mb-8 text-center">
                    <div className="inline-flex p-4 rounded-full bg-slate-50 text-orange-600 mb-4 border border-slate-100">
                        <ChefHat className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-orange-950">Kitchen Access</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Please verify your staff identity</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100 italic">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Kitchen ID</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Access Key</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                AUTHORIZING...
                            </>
                        ) : (
                            'ENTER KITCHEN'
                        )}
                    </button>
                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">
                            SECURE INTERNAL PORTAL
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
