
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    // Paths protection
    const path = request.nextUrl.pathname;

    if (path.startsWith('/admin') || path.startsWith('/kitchen') || path.startsWith('/billing')) {
        // Automatic redirection to dashboards
        if (path === '/admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (path === '/kitchen') {
            return NextResponse.redirect(new URL('/kitchen/dashboard', request.url));
        }
        if (path === '/billing') {
            return NextResponse.redirect(new URL('/billing/dashboard', request.url));
        }

        // Allow access to admin login if it exists, or redirect to generic login
        if (path.includes('/login')) {
            if (token) {
                try {
                    // If already logged in, redirect to respective dashboard
                    const { payload } = await jwtVerify(token, SECRET_KEY);
                    if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                    if (payload.role === 'kitchen') return NextResponse.redirect(new URL('/kitchen', request.url));
                    if (payload.role === 'billing') return NextResponse.redirect(new URL('/billing', request.url));
                } catch (e) {
                    // Invalid token, proceed to login
                }
            }
            return NextResponse.next();
        }

        // Protected Routes
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            const role = payload.role;

            if (path.startsWith('/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
            }
            if (path.startsWith('/kitchen') && (role !== 'kitchen' && role !== 'admin')) {
                return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
            }
            if (path.startsWith('/billing') && (role !== 'billing' && role !== 'admin')) {
                return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
            }
        } catch (e) {
            // Invalid token
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/kitchen/:path*', '/billing/:path*'],
};
