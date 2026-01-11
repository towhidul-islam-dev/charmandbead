// app/api/users/route.js (Create this new file)

import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth'; // 💡 Import the utility to check for Admin status

// --- PUT (Update User Role/Promote) ---
export async function PUT(request) {
  const { user: currentUser, error: authError } = verifyAuthToken();

  // 1. Authorization Check: Only an existing Admin can run this update
  if (authError || currentUser.role !== 'admin') {
    return NextResponse.json({ 
      message: 'Access denied. You must be an administrator to perform this action.' 
    }, { status: 403 }); // 403 Forbidden
  }

  try {
    await connectToDatabase();
    
    // Get the data about the user to modify
    const { userId, newRole } = await request.json(); 

    if (!userId || !['user', 'admin'].includes(newRole)) {
      return NextResponse.json({ message: 'Invalid user ID or role.' }, { status: 400 });
    }

    // 2. Update the user document in the database
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, runValidators: true } // Return the updated doc and run schema validators
    ).select('-password'); // Don't return the hash

    if (!updatedUser) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: `User ${updatedUser.email} role updated to ${newRole}.`,
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json({ 
      message: 'An internal server error occurred during the update.',
      details: error.message 
    }, { status: 500 });
  }
}