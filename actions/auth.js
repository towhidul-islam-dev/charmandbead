"use server";

import User from "@/models/User"; 
import { generateOTP } from "@/lib/tokens"; 
import connectDB from "@/lib/mongodb"; 
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * STEP 1: Start Reset (Generate & Send 6-Digit OTP via Resend)
 */
export async function startPasswordReset(email) {
  try {
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return { success: true }; // Security: Don't reveal if user exists

    // 🛡️ Check Cooldown (2 Minutes) to prevent spam
    if (user.resetTokenSentAt) {
      const lastSent = new Date(user.resetTokenSentAt).getTime();
      const cooldown = 2 * 60 * 1000; 
      if (Date.now() - lastSent < cooldown) {
        const timeLeft = Math.ceil((cooldown - (Date.now() - lastSent)) / 1000);
        return { success: false, error: `Wait ${timeLeft}s before retrying.` };
      }
    }

    // 🔢 Generate 6-Digit OTP
    const otp = generateOTP(); 
    user.otpCode = otp; 
    user.otpExpiry = Date.now() + 600000; // 10 Minutes expiry
    user.resetTokenSentAt = new Date();
    await user.save();

    // ✉️ Send OTP Email via Resend
    const { error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: [normalizedEmail],
      subject: `Your Security Code: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 450px; margin: auto; padding: 40px; border: 2px solid #FBB6E6; border-radius: 32px; background-color: #ffffff; text-align: center;">
          <h2 style="color: #3E442B; text-transform: uppercase; font-style: italic;">Identity <span style="color: #EA638C;">Verification</span></h2>
          <p style="color: #3E442B; font-size: 14px; margin-bottom: 25px;">Use the following code to authorize your password reset.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 20px; border: 1px dashed rgba(62, 68, 43, 0.2);">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #3E442B; font-family: monospace;">${otp}</span>
          </div>

          <p style="color: #EA638C; font-size: 10px; font-weight: 900; margin-top: 25px; letter-spacing: 1px;">THIS CODE EXPIRES IN 10 MINUTES.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 9px; color: #3E442B; opacity: 0.6; text-transform: uppercase;">If you did not request this, please secure your account immediately.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: "Failed to dispatch email service." };
    }

    return { success: true };
  } catch (error) {
    console.error("Auth Action Error:", error);
    return { success: false, error: "System failure. Try again later." };
  }
}

/**
 * STEP 2: Verify OTP & Issue Temporary Reset Token
 */
export async function verifyOTPAction(email, otp) {
  try {
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      otpCode: otp,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return { success: false, error: "Invalid or expired security code." };
    }

    // Generate a temporary reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 600000; // 10 minutes to finish the password change
    user.otpCode = null; // Clear OTP after use
    await user.save();

    return { success: true, token: resetToken };
  } catch (error) {
    return { success: false, error: "Verification failed." };
  }
}

/**
 * STEP 3: Final Password Update
 */
export async function updatePasswordAction(token, newPassword) {
  try {
    await connectDB();
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return { success: false, error: "Session expired. Please restart." };

    user.password = newPassword; // Hashing happens in user model pre-save hook
    user.resetToken = null; 
    user.resetTokenExpiry = null;
    await user.save();

    return { success: true };
  } catch (error) {
    return { success: false, error: "Update failed." };
  }
}