import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bill from '@/models/Bill';
import Order from '@/models/Order';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        
        const bill = await Bill.findById(params.id).populate('orders');
        if (!bill) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        return NextResponse.json(bill);
    } catch (error) {
        console.error('Failed to fetch bill:', error);
        return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        
        const body = await req.json();
        const { paymentStatus, splitPayments } = body;

        const updateData: any = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (splitPayments) updateData.splitPayments = splitPayments; // expects the entire array to be replaced/updated

        const updatedBill = await Bill.findByIdAndUpdate(
            params.id,
            { $set: updateData },
            { new: true }
        ).populate('orders');

        if (!updatedBill) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        // If payment status changed to Paid, also update linked Orders
        if (paymentStatus === 'Paid') {
            await Order.updateMany(
                { billId: updatedBill._id },
                { $set: { paymentStatus: 'Paid' } }
            );
        } else if (paymentStatus === 'Refunded') {
            // Depending on logic, refunded orders might need status update
            await Order.updateMany(
                { billId: updatedBill._id },
                { $set: { paymentStatus: 'Failed' } } // or a new 'Refunded' state if added to Order schema
            );
        }

        return NextResponse.json(updatedBill);
    } catch (error) {
        console.error('Failed to update bill:', error);
        return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
    }
}
