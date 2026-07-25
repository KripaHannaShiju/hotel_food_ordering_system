import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bill from '@/models/Bill';

export async function GET(req: Request) {
    try {
        await connectDB();
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Aggregate Daily Sales
        const dailySales = await Bill.aggregate([
            { $match: { createdAt: { $gte: startOfDay }, paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        // Aggregate Weekly Sales
        const weeklySales = await Bill.aggregate([
            { $match: { createdAt: { $gte: startOfWeek }, paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        // Aggregate Monthly Sales
        const monthlySales = await Bill.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        // Recent Transactions
        const recentTransactions = await Bill.find({ paymentStatus: 'Paid' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('tableNumber totalAmount createdAt paymentStatus');

        return NextResponse.json({
            daily: {
                revenue: dailySales[0]?.totalRevenue || 0,
                orders: dailySales[0]?.count || 0
            },
            weekly: {
                revenue: weeklySales[0]?.totalRevenue || 0,
                orders: weeklySales[0]?.count || 0
            },
            monthly: {
                revenue: monthlySales[0]?.totalRevenue || 0,
                orders: monthlySales[0]?.count || 0
            },
            recentTransactions
        });
    } catch (error) {
        console.error('Failed to fetch sales analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
