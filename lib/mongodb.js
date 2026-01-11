// lib/mongodb.js (or lib/dbConnect.js)

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // --- CRITICAL CHANGE: Use .catch() or a try/catch block ---
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false, // Recommended setting
        }).then(mongoose => {
            return mongoose;
        }).catch(err => { // Catch errors during connection attempt
            console.error("MongoDB Connection Error:", err);
            cached.promise = null; // Clear promise on failure
            throw new Error("Failed to connect to MongoDB."); // Re-throw a controlled error
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.conn = null;
        throw e;
    }

    return cached.conn;
}
