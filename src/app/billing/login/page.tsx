
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BillingLogin() {
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
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === 'billing' || data.role === 'admin') {
                    toast.success('Welcome to the Billing Deck!');
                    router.push('/billing/dashboard');
                } else {
                    setError('Unauthorized: You do not have billing access');
                    toast.error('Billing access denied');
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
        <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white selection:bg-indigo-500/30">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-500/10 blur-[130px] rounded-full" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <button 
                    onClick={() => router.push('/')}
                    className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <div className="backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-3xl p-10 shadow-2xl">
                    <div className="mb-10 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                            <CreditCard className="w-10 h-10" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white mb-2">Billing Desk</h2>
                        <p className="text-zinc-400 font-medium tracking-tight">Payments & POS Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-bold text-center border border-rose-500/20 animate-shake">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Staff ID</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] focus:outline-none transition-all font-medium placeholder:text-zinc-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Billing ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Access Key</label>
                            <input
                                type="password"
                                className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] focus:outline-none transition-all font-medium placeholder:text-zinc-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 px-6 py-5 text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Authorizing...
                                    </>
                                ) : (
                                    'ACTIVATE TERMINAL'
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <div className="pt-6 text-center">
                            <p 
                                className="text-xs text-zinc-500 font-bold hover:text-zinc-300 cursor-pointer transition-colors"
                                onClick={() => router.push('/login')}
                            >
                                NOT BILLING? USE STAFF PORTAL
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
