import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bill from '@/models/Bill';
import Order from '@/models/Order';

export async function GET(req: Request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const table = searchParams.get('table');

        const query: any = {};
        if (status) query.paymentStatus = status;
        if (table) query.tableNumber = table;

        const bills = await Bill.find(query)
            .populate('orders')
            .sort({ createdAt: -1 });

        return NextResponse.json(bills);
    } catch (error) {
        console.error('Failed to fetch bills:', error);
        return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        
        const body = await req.json();
        const { 
            tableNumber, 
            orders, 
            subtotal, 
            gstAmount, 
            serviceChargeAmount, 
            discountAmount, 
            couponCode, 
            totalAmount, 
            paymentStatus, 
            splitPayments, 
            customerName, 
            customerPhone 
        } = body;

        if (!tableNumber || !orders || !orders.length || subtotal === undefined || totalAmount === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newBill = new Bill({
            tableNumber,
            orders,
            subtotal,
            gstAmount,
            serviceChargeAmount,
            discountAmount,
            couponCode,
            totalAmount,
            paymentStatus: paymentStatus || 'Pending',
            splitPayments: splitPayments || [],
            customerName,
            customerPhone
        });

        const savedBill = await newBill.save();

        // Link orders to this bill and potentially update their status
        await Order.updateMany(
            { _id: { $in: orders } },
            { 
                $set: { 
                    billId: savedBill._id,
                    paymentStatus: savedBill.paymentStatus === 'Paid' ? 'Paid' : 'Pending'
                } 
            }
        );

        return NextResponse.json(savedBill, { status: 201 });
    } catch (error) {
        console.error('Failed to create bill:', error);
        return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
    }
}
