import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import Notification from "@/models/Notification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Enhanced Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Please fill in all fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check for existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ message: "This email is already registered." }, { status: 409 });
    }

    // 3. Create User 
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: "user", 
    });

    // 4. Internal Dashboard Notification (For your admin panel)
    try {
      await Notification.create({
        title: "New Partner Joined",
        message: `${name} (${cleanEmail}) just registered for wholesale access.`,
        type: "REGISTRATION",
      });
    } catch (nErr) {
      console.error("NOTIFICATION_DB_ERROR:", nErr);
    }

    // 5. Email Alerts (Admin Notify + User Welcome)
    try {
      // 🟢 A. NOTIFY ADMIN (You)
      await resend.emails.send({
        from: "Charm & Bead Registry <onboarding@resend.dev>", 
        to: ["towhidulislam12@gmail.com"], 
        subject: "New Partner Registration: " + name.trim(),
        html: `
          <div style="font-family: sans-serif; border: 1px solid #FBB6E6; border-radius: 30px; padding: 40px; max-width: 500px; margin: auto;">
            <h2 style="color: #3E442B; font-style: italic;">New <span style="color: #EA638C;">Wholesale</span> Lead</h2>
            <p style="font-size: 14px; color: #3E442B;">A new partner has registered on the <strong>Charm & Bead Registry</strong>.</p>
            <div style="background: #FAFAFA; padding: 20px; border-radius: 15px; border-left: 5px solid #EA638C; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name.trim()}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${cleanEmail}</p>
            </div>
          </div>
        `,
      });

      // 🟢 B. WELCOME USER (The Customer)
      await resend.emails.send({
        from: "Charm & Bead <onboarding@resend.dev>", 
        to: [cleanEmail], // Dynamic email from user input
        subject: `Welcome to the Registry, ${name.split(' ')[0]}!`,
        html: `
          <div style="font-family: sans-serif; border: 1px solid #FBB6E6; border-radius: 30px; padding: 40px; max-width: 500px; margin: auto; text-align: center;">
            <h2 style="color: #3E442B; font-style: italic;">Welcome to <span style="color: #EA638C;">Charm & Bead</span></h2>
            <p style="color: #3E442B;">Hi ${name.trim()}, your account has been created successfully. You now have access to our wholesale partner portal.</p>
            <div style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}" style="background: #3E442B; color: #FBB6E6; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Start Exploring</a>
            </div>
            <p style="font-size: 11px; color: #999; text-transform: uppercase;">Unlock Creativity with every bead.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("EMAIL_ERROR:", mailError);
    }

    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CRITICAL_REGISTRATION_ERROR:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}