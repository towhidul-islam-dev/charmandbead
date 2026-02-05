"use server";

import bcrypt from "bcryptjs";
import User from "@/models/User"; 
import { generateResetToken } from "@/lib/tokens";
import connectDB from "@/lib/mongodb"; 
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function startPasswordReset(email) {
  try {
    await connectDB();
    
    // Normalize email to ensure it matches the DB (prevents "Email not found" bugs)
    const normalizedEmail = email.toLowerCase().trim();
    
    const resetToken = generateResetToken();
    const expiry = Date.now() + 3600000;

    // Use normalizedEmail to find the user
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { resetToken, resetTokenExpiry: expiry }
    );

    // If no user is found, we still return success: true. 
    // This is a "Silent Pass" to stop bots from knowing who has an account.
    if (!user) return { success: true };

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const { error } = await resend.emails.send({
      from: 'Charm & Bead Security <onboarding@resend.dev>', // Keep your current verified sender
      to: [normalizedEmail],
      subject: 'Secure Access Recovery',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 2px solid #FBB6E6; border-radius: 32px; background-color: #ffffff; text-align: center;">
          <h2 style="color: #3E442B; text-transform: uppercase; letter-spacing: 2px; font-style: italic;">Recover <span style="color: #EA638C;">Access</span></h2>
          <p style="color: #3E442B; font-size: 14px; font-weight: 600;">A password reset was requested for your account.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #3E442B; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 11px; display: inline-block; letter-spacing: 2px;">ESTABLISH NEW KEY</a>
          </div>
          <p style="color: #EA638C; font-size: 10px; font-weight: 900; letter-spacing: 1px;">LINK EXPIRES IN 1 HOUR.</p>
          <hr style="border: none; border-top: 1px solid #FBB6E6; margin-top: 30px;" />
          <p style="font-size: 9px; color: #3E442B; opacity: 0.6; text-transform: uppercase;">Charm & Bead Official Registry</p>
        </div>
      `,
    });

    if (error) return { success: false, error: "Email service is temporarily busy." };
    return { success: true };
  } catch (error) {
    console.error("Auth Action Error:", error);
    return { success: false, error: "System error. Please try again." };
  }
}

export async function updatePasswordAction(token, newPassword) {
  try {
    await connectDB();
    
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return { success: false, error: "Invalid or expired link." };

    // Update fields exactly as before
    user.password = newPassword; 
    user.resetToken = null; 
    user.resetTokenExpiry = null;
    
    // This triggers your pre-save hook for hashing - safely preserved.
    await user.save();

    return { success: true };
  } catch (error) {
    return { success: false, error: "System update failed." };
  }
}