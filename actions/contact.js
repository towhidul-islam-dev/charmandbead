"use server";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
import nodemailer from "nodemailer";

export async function submitContactForm(formData) {
  try {
    await dbConnect();

    // 1. Save to Database
    await Contact.create({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    // 2. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 3. Format the body for the email
    const emailBody = `
      <div style="font-family: sans-serif; padding: 20px; color: #3E442B;">
        <h2 style="color: #EA638C;">New Contact Message Received</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Sender Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <hr style="border: none; border-top: 1px solid #FBB6E6; margin: 20px 0;" />
        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${formData.message}</p>
      </div>
    `;

    // 4. Send the mail
    await transporter.sendMail({
      from: `"${formData.name}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: formData.email,
      subject: `New Contact: ${formData.subject}`,
      html: emailBody,
    });

    return { success: true };
  } catch (error) {
    console.error("CONTACT_SUBMIT_ERROR:", error);
    return { success: false, message: "Error sending message." };
  }
}