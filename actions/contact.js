"use server";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
// import { sendEmail } from "@/lib/mail"; // This will now work!

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

    // 2. Format the body for the email
    const emailBody = `
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Subject:</strong> ${formData.subject}</p>
      <hr style="border: none; border-top: 1px solid #FBB6E6; margin: 20px 0;" />
      <p style="white-space: pre-wrap;">${formData.message}</p>
    `;

    // 3. Send the mail
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact: ${formData.subject}`,
      html: emailBody,
    });

    return { success: true };
  } catch (error) {
    console.error("CONTACT_SUBMIT_ERROR:", error);
    return { success: false, message: "Error sending message." };
  }
}