
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

const ROLES = {
    ADMIN: {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        redirect: '/admin/dashboard'
    },
    KITCHEN: {
        username: process.env.KITCHEN_USERNAME,
        password: process.env.KITCHEN_PASSWORD,
        role: 'kitchen',
        redirect: '/kitchen'
    },
    BILLING: {
        username: process.env.BILLING_USERNAME,
        password: process.env.BILLING_PASSWORD,
        role: 'billing',
        redirect: '/billing'
    }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, portal } = body;

        let user = null;

        if (username === ROLES.ADMIN.username && password === ROLES.ADMIN.password) {
            user = ROLES.ADMIN;
        } else if (username === ROLES.KITCHEN.username && password === ROLES.KITCHEN.password) {
            user = ROLES.KITCHEN;
        } else if (username === ROLES.BILLING.username && password === ROLES.BILLING.password) {
            user = ROLES.BILLING;
        }

        if (user) {
            // Reject cross-portal logins, except for admin who has full access
            if (portal && user.role !== portal && user.role !== 'admin') {
                return NextResponse.json({ error: `Access denied: Please use the ${user.role} portal to log in.` }, { status: 403 });
            }
            const token = await new SignJWT({ username: user.username, role: user.role })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('24h')
                .sign(SECRET_KEY);

            const cookieStore = await cookies();
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            // Set role cookie for client-side redirection if needed, though redirect is returned
            cookieStore.set('user_role', user.role, {
                path: '/',
                maxAge: 60 * 60 * 24
            });

            return NextResponse.json({ message: 'Login successful', redirect: user.redirect, role: user.role });
        } else {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
