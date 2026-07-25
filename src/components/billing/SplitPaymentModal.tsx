'use client';

import { useState } from 'react';
import { X, Plus, Banknote, Smartphone, CreditCard, Wallet, Trash2 } from 'lucide-react';

interface SplitPayment {
    method: 'Cash' | 'UPI' | 'Card' | 'Wallet';
    amount: number;
}

interface SplitPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onComplete: (payments: SplitPayment[]) => void;
}

const PAYMENT_METHODS = [
    { id: 'Cash', icon: Banknote },
    { id: 'UPI', icon: Smartphone },
    { id: 'Card', icon: CreditCard },
    { id: 'Wallet', icon: Wallet },
] as const;

export default function SplitPaymentModal({ isOpen, onClose, totalAmount, onComplete }: SplitPaymentModalProps) {
    const [payments, setPayments] = useState<SplitPayment[]>([]);
    const [currentMethod, setCurrentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Wallet'>('Cash');
    const [currentAmount, setCurrentAmount] = useState<string>('');

    if (!isOpen) return null;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, totalAmount - totalPaid);

    const handleAddPayment = () => {
        const amt = parseFloat(currentAmount);
        if (isNaN(amt) || amt <= 0) return;
        if (amt > remaining) {
            alert(`Amount exceeds remaining balance of ₹${remaining.toFixed(2)}`);
            return;
        }

        setPayments([...payments, { method: currentMethod, amount: amt }]);
        setCurrentAmount('');
    };

    const handleRemovePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleComplete = () => {
        if (remaining > 0) {
            alert(`Cannot complete. Remaining balance: ₹${remaining.toFixed(2)}`);
            return;
        }
        onComplete(payments);
        setPayments([]);
        setCurrentAmount('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Split Payment</h2>
                        <p className="text-sm text-gray-500 font-medium">Divide the bill into multiple methods</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex justify-between items-center border border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Bill</p>
                            <p className="text-2xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remaining</p>
                            <p className={`text-2xl font-black ${remaining > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                ₹{remaining.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex gap-2">
                            {PAYMENT_METHODS.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setCurrentMethod(method.id)}
                                    className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                        currentMethod === method.id 
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <method.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{method.id}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                                <input
                                    type="number"
                                    value={currentAmount}
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                    placeholder={remaining.toFixed(2)}
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-lg"
                                />
                            </div>
                            <button 
                                onClick={handleAddPayment}
                                disabled={remaining === 0 || !currentAmount}
                                className="px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Add
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Parts</p>
                        {payments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 italic">No payments added yet</p>
                        ) : (
                            payments.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            {PAYMENT_METHODS.find(m => m.id === p.method)?.icon({ className: 'w-4 h-4' })}
                                        </div>
                                        <span className="font-bold text-gray-700">{p.method}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-gray-900">₹{p.amount.toFixed(2)}</span>
                                        <button onClick={() => handleRemovePayment(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleComplete}
                        disabled={remaining > 0}
                        className="w-full py-4 rounded-xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                    >
                        Confirm Payment Split
                    </button>
                </div>
            </div>
        </div>
    );
}
