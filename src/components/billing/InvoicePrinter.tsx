'use client';

import React from 'react';

interface InvoicePrinterProps {
    bill: any;
    businessInfo?: {
        name: string;
        address: string;
        gstin: string;
        phone: string;
    }
}

export default function InvoicePrinter({ bill, businessInfo }: InvoicePrinterProps) {
    if (!bill) return null;

    const info = businessInfo || {
        name: 'HOTEL DELISH',
        address: '123 Culinary Avenue, Foodville',
        gstin: '22AAAAA0000A1Z5',
        phone: '+91 98765 43210'
    };

    // We use a specific class pattern: hidden by default, visible ONLY when printing
    return (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] text-black font-mono text-sm p-4 w-full h-full">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                    <h1 className="text-3xl font-black uppercase mb-1">{info.name}</h1>
                    <p className="text-xs">{info.address}</p>
                    <p className="text-xs">Ph: {info.phone}</p>
                    <p className="text-xs mt-1">GSTIN: {info.gstin}</p>
                </div>

                <div className="flex justify-between mb-4 text-xs font-bold">
                    <div>
                        <p>Bill No: #{bill._id.slice(-6).toUpperCase()}</p>
                        <p>Date: {new Date(bill.createdAt).toLocaleDateString()} {new Date(bill.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                        <p>Table: {bill.tableNumber}</p>
                        <p>Status: {bill.paymentStatus}</p>
                    </div>
                </div>

                <table className="w-full mb-4 text-sm">
                    <thead>
                        <tr className="border-b border-gray-400">
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2">Qty</th>
                            <th className="text-right py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border-b border-gray-400">
                        {/* We aggregate all items from the linked orders */}
                        {bill.orders.flatMap((o: any) => o.items).map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="py-2 pr-2">{item.name}</td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="space-y-1 mb-4 text-sm border-b-2 border-dashed border-gray-300 pb-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{bill.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>GST (5%)</span>
                        <span>₹{bill.gstAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Service Charge (2%)</span>
                        <span>₹{bill.serviceChargeAmount?.toFixed(2)}</span>
                    </div>
                    {bill.discountAmount > 0 && (
                        <div className="flex justify-between font-bold">
                            <span>Discount {bill.couponCode ? `(${bill.couponCode})` : ''}</span>
                            <span>- ₹{bill.discountAmount?.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-gray-400">
                        <span>TOTAL</span>
                        <span>₹{bill.totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                {bill.splitPayments && bill.splitPayments.length > 0 && (
                    <div className="mb-4 text-xs">
                        <p className="font-bold border-b border-gray-300 mb-1">Payment Details</p>
                        {bill.splitPayments.map((p: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                                <span>{p.method}</span>
                                <span>₹{p.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center text-xs mt-8">
                    <p className="font-bold">Thank you for dining with us!</p>
                    <p>Have a great day.</p>
                </div>
            </div>
        </div>
    );
}
