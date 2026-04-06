export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Menu from '@/models/Menu';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
        }

        // Fetch prep times for items to calculate total estimated prep time
        const itemIds = body.items.map((i: any) => i.menuItem);
        const menuItems = await Menu.find({ _id: { $in: itemIds } });

        let maxPrepTime = 15; // default 15 mins
        if (menuItems.length > 0) {
            maxPrepTime = Math.max(...menuItems.map(item => item.prepTime || 15));
        }

        const order = await Order.create({
            ...body,
            estimatedPrepTime: maxPrepTime
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Order error:', error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const tableNumber = searchParams.get('tableNumber');
        const sessionId = searchParams.get('sessionId');

        // Security logic: if no table or session filter is provided, we check for a management role
        const isSelfOrderFetch = tableNumber && sessionId;
        
        if (!isSelfOrderFetch) {
            const token = (await cookies()).get('auth_token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized: Management access required to fetch all orders' }, { status: 401 });
            }

            try {
                const { payload } = await jwtVerify(token, SECRET_KEY);
                const role = payload.role;
                const allowedRoles = ['admin', 'kitchen', 'billing'];
                
                if (!allowedRoles.includes(role as string)) {
                    return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
                }
            } catch (e) {
                return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
            }
        }

        // Build filter: always scope by tableNumber if given
        const filter: Record<string, string> = {};
        if (tableNumber) filter.tableNumber = tableNumber;
        // Scope to session if provided — new customers won't see previous sessions
        if (sessionId) filter.sessionId = sessionId;

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        // Map to ensure estimatedPrepTime exists (for older records in DB)
        const updatedOrders = orders.map(order => {
            const obj = order.toObject();
            if (obj.estimatedPrepTime === undefined || obj.estimatedPrepTime === null) {
                obj.estimatedPrepTime = 15; // default fallback
            }
            return obj;
        });
        return NextResponse.json(updatedOrders);
    } catch (error: any) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
    }
}
