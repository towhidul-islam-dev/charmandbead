import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
    }

    // Create user - Note: hashing happens in models/User.js
    const newUser = await User.create({ 
      name: name.trim(), 
      email: cleanEmail, 
      password 
    });

    return NextResponse.json({ 
      message: 'Registration successful!', 
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    }, { status: 201 });

  } catch (error) {
    console.error("CRITICAL_REGISTRATION_ERROR:", error);
    
    // Specific MongoDB Error Handling
    if (error.name === 'MongoServerError' && error.code === 11000) {
        return NextResponse.json({ message: 'Email already exists in database.' }, { status: 409 });
    }

    return NextResponse.json({ 
      message: 'Server Error', 
      details: error.message // 💡 This will show the real error in the browser console
    }, { status: 500 });
  }
}