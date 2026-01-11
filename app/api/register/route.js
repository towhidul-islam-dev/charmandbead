import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// --- POST (User Registration) ---
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get email and password from the client request
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password || name.trim() === '' || email.trim() === '' || password.length < 6) {
      return NextResponse.json(
        { message: 'All fields (Name, Email, Password) are required and must be valid.' }, 
        { status: 400 } // 400 Bad Request
      );
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // 2. Create the new user. The password hashing happens automatically 
    //    via the 'pre-save' hook defined in models/User.js!
    const newUser = await User.create({ 
      // 💡 Clean up the name string before creating
      name: name.trim(), 
      email, 
      password 
    });

    // 3. (Optional but recommended) Return only necessary user data
    const safeUser = { 
      id: newUser._id, 
      name: newUser.name,
      email: newUser.email, 
      role: newUser.role 
    };

    return NextResponse.json({ 
      message: 'Registration successful yahoo!!!', 
      user: safeUser 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    // Handle Mongoose validation errors (e.g., invalid email format)
  
    if (error.code === 11000) {
        return NextResponse.json({ 
            message: 'User already exists with this email address.',
            field: 'email'
        }, { status: 409 }); 
    }

    if (error.name === 'ValidationError') {
        return NextResponse.json({ 
            message: 'Validation failed.',
            details: error.message 
        }, { status: 400 }); 
    }
    return NextResponse.json({ 
      message: 'Failed to register user',
      details: error.message 
    }, { status: 500 });
  }
}