// lib/auth.js - Diagnostic Mode

'use strict'; 
import 'server-only'; 

const JWT_SECRET = process.env.JWT_SECRET;

// Use require() for next/headers and jsonwebtoken (CommonJS fix)
const { cookies } = require('next/headers'); 
const jwt = require('jsonwebtoken'); 

export async function verifyAuthToken() { 
    if (!JWT_SECRET) { 
        console.error("CRITICAL: JWT_SECRET environment variable is missing.");
        return { user: null, error: 'Server configuration error.' };
    }

    // --- DIAGNOSTIC LOGS ---
    console.log("--- AUTH DIAGNOSTICS START ---");
    
    // Log 1: What is the 'cookies' object itself?
    // In a correct environment, this should show it's a function.
    console.log("D1: Type of 'cookies' imported object:", typeof cookies); 
    
    // Log 2: What is returned when calling 'cookies()'?
    // In a correct environment, this should be the CookieStore object.
    const cookieStore = cookies();
    console.log("D2: Type of 'cookies()' result:", typeof cookieStore);
    console.log("D2: Keys/methods on 'cookies()' result (JSON.stringify):", JSON.stringify(Object.keys(cookieStore)));
    
    // Log 3: Inspect the methods on the returned object (crucial)
    console.log("D3: Does cookieStore have .get property?", 'get' in cookieStore);
    console.log("D4: Does cookieStore have .set property?", 'set' in cookieStore);
    // -------------------------

    try {
        // This is the problematic line:
        const token = cookieStore.get('token')?.value; 

        if (!token) { return { user: null, error: 'No session token' }; }
        
        // ... (rest of verification logic) ...

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.role) { return { user: null, error: 'Token corrupted, missing role' }; }

        console.log("--- AUTH DIAGNOSTICS END: SUCCESS ---");
        return { user: decoded, error: null };
    } catch (err) {
        console.warn(`[Auth Cleanup] Verification failed: ${err.message}`);
        
        // Attempt cleanup using the already resolved cookieStore
        if ('set' in cookieStore) {
            cookieStore.set('token', '', { 
                maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/',
            }); 
            console.log("Cleanup: Successfully used .set() to expire token.");
        } else {
            console.error("Cleanup FAILED: cookieStore object still lacks .set() method.");
        }
        
        return { user: null, error: `Token verification failed: ${err.message}` };
    }
}