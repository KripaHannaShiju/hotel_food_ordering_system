
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    // Paths protection
    const path = request.nextUrl.pathname;

    // Handle any login path
    if (path.endsWith('/login')) {
        if (token) {
            try {
                // If already logged in, redirect to respective dashboard
                const { payload } = await jwtVerify(token, SECRET_KEY);
                if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                if (payload.role === 'kitchen') return NextResponse.redirect(new URL('/kitchen/dashboard', request.url));
                if (payload.role === 'billing') return NextResponse.redirect(new URL('/billing/dashboard', request.url));
            } catch (e) {
                // Invalid token, proceed to login
            }
        }
        return NextResponse.next();
    }

    if (path.startsWith('/admin') || path.startsWith('/kitchen') || path.startsWith('/billing')) {
        // Automatic redirection to dashboards
        if (path === '/admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (path === '/kitchen') return NextResponse.redirect(new URL('/kitchen/dashboard', request.url));
        if (path === '/billing') return NextResponse.redirect(new URL('/billing/dashboard', request.url));

        // Determine correct login portal based on current path scope
        let targetLoginPortal = '/login'; // Failsafe, though unified is gone.
        if (path.startsWith('/admin')) targetLoginPortal = '/admin/login';
        if (path.startsWith('/kitchen')) targetLoginPortal = '/kitchen/login';
        if (path.startsWith('/billing')) targetLoginPortal = '/billing/login';

        // Protected Routes
        if (!token) {
            return NextResponse.redirect(new URL(targetLoginPortal, request.url));
        }

        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            const role = payload.role;

            if (path.startsWith('/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL(`${targetLoginPortal}?error=unauthorized`, request.url));
            }
            if (path.startsWith('/kitchen') && (role !== 'kitchen' && role !== 'admin')) {
                return NextResponse.redirect(new URL(`${targetLoginPortal}?error=unauthorized`, request.url));
            }
            if (path.startsWith('/billing') && (role !== 'billing' && role !== 'admin')) {
                return NextResponse.redirect(new URL(`${targetLoginPortal}?error=unauthorized`, request.url));
            }
        } catch (e) {
            // Invalid token
            return NextResponse.redirect(new URL(targetLoginPortal, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/kitchen/:path*', '/billing/:path*'],
};
