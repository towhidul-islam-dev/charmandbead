"use server";
import nodemailer from "nodemailer";

export async function sendInvoiceEmail(orderData) {
  const { orderId, items, totalAmount, name, email } = orderData;

  // 🔴 1. Validate Recipient
  // This prevents the "No recipients defined" error
  if (!email || email === "" || !email.includes("@")) {
    console.error("❌ Email sending aborted: Invalid or missing recipient email address.");
    return { success: false, error: "Missing recipient email" };
  }

  // 2. Setup the connection (Transporter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 3. Format the items for the email table
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0; font-family: sans-serif; font-size: 14px; color: #3E442B;">
        ${item.productName || item.name} <br/>
        <small style="color: #EA638C;">${item.variant?.name || ''} ${item.variant?.size || ''}</small>
      </td>
      <td style="text-align: center; font-size: 14px; color: #3E442B;">${item.quantity}</td>
      <td style="text-align: right; font-size: 14px; color: #3E442B; font-weight: bold;">৳${item.price.toLocaleString()}</td>
    </tr>
  `).join("");

  // 4. The Branded HTML Template (Using your brand colors)
  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fdfdfd; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; border: 1px solid #f1f1f1; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        
        <div style="background: #3E442B; padding: 40px 20px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 4px; font-style: italic; text-transform: uppercase;">CHARM STORE</h1>
          <p style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 10px; color: #EA638C;">Official Wholesale Invoice</p>
        </div>

        <div style="padding: 40px; color: #3E442B;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #666; line-height: 1.6;">Your registry order has been successfully processed. Below are your invoice details for reference.</p>
          
          <div style="margin: 30px 0; padding: 15px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #EA638C;">
            <p style="margin: 0; font-size: 12px; font-weight: bold;">ORDER ID: <span style="color: #EA638C;">#INV-${orderId.toString().slice(-6).toUpperCase()}</span></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="text-align: left; color: #999; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #3E442B;">
                <th style="padding-bottom: 12px;">Product Selection</th>
                <th style="padding-bottom: 12px; text-align: center;">Qty</th>
                <th style="padding-bottom: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; margin-top: 30px; border-top: 2px dashed #eee; padding-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Amount Payable</p>
            <h2 style="margin: 5px 0 0 0; color: #3E442B; font-size: 32px;">৳${totalAmount.toLocaleString()}</h2>
          </div>
        </div>

        <div style="background: #3E442B; padding: 20px; text-align: center; color: #fff; font-size: 10px; letter-spacing: 1px;">
          THIS IS A SYSTEM GENERATED INVOICE • CHARM STORE REGISTRY
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #bbb; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
        High-Quality Wholesale Solutions
      </p>
    </div>
  `;

  // 5. Send the mail
  try {
    const result = await transporter.sendMail({
      from: `"Charm Store" <${process.env.EMAIL_USER}>`,
      to: email, // The Customer
      bcc: process.env.EMAIL_USER, // 🟢 You get a copy automatically!
      subject: `Order Confirmation: #INV-${orderId.toString().slice(-6).toUpperCase()}`,
      html: emailHtml,
    });
    
    console.log("✅ Invoice Email Sent Successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    return { success: false, error: error.message };
  }
}