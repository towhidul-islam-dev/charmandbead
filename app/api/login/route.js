// app/api/login/route.js - The final, robust version for cookie handling

import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// 💡 IMPORTANT: Comment out the cookies utility import, as we will set the header manually.
// import { cookies } from 'next/headers'; 

const JWT_SECRET = process.env.JWT_SECRET; 

export async function POST(request) {
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        return NextResponse.json({ 
            message: 'Server configuration error. JWT secret missing.' 
        }, { status: 500 });
    }

    try {
        await connectToDatabase();
        
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password'); 

        if (!user || !(await user.comparePassword(password))) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 }); 
        }

        // 1. Generate the JWT token payload
        const payload = { 
            id: user._id, 
            role: user.role, 
            name: user.name,
            email: user.email
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '7d', 
        });

        // 2. Prepare safe user object
        const safeUser = { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
        };

        // 3. Create the standard JSON response
        // This is the response object we will attach the cookie header to.
        const response = NextResponse.json({ 
            message: 'Login successful', 
            user: safeUser 
        }, { status: 200 }); 

        // 4. Manually set the secure HTTP-Only cookie header (CRITICAL CHANGE)
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        const cookieOptions = [
            `Max-Age=${maxAge}`, 
            `HttpOnly`, // Prevents client-side JS access
            `Secure=${process.env.NODE_ENV === 'production'}`, // Use HTTPS in production
            `Path=/`,
            `SameSite=Strict`
        ].join('; ');
        
        // Write the cookie directly to the response headers
        response.headers.set('Set-Cookie', `token=${token}; ${cookieOptions}`);
        
        // 
        
        return response; // Return the response object with the attached header

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ 
            message: 'An internal server error occurred during login.',
            details: error.message 
        }, { status: 500 });
    }
}