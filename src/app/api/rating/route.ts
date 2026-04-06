import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

async function verifyAdmin() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        
        const { rating, comment, customerName, tableNumber, sessionId } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
        }

        const newRating = await Rating.create({
            rating,
            comment,
            customerName,
            tableNumber,
            sessionId,
        });

        return NextResponse.json({ success: true, rating: newRating }, { status: 201 });
    } catch (error: any) {
        console.error('Rating submission error:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit rating' }, { status: 500 });
    }
}

export async function GET() {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    try {
        await dbConnect();
        const ratings = await Rating.find().sort({ createdAt: -1 });
        return NextResponse.json(ratings);
    } catch (error: any) {
        console.error('Fetch ratings error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch ratings' }, { status: 500 });
    }
}
