"use server";
import nodemailer from "nodemailer";

// 🔐 SECURITY: Move transporter outside the function to reuse SMTP connections
// in serverless environments (Vercel/Next.js)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendInvoiceEmail(orderData) {
  const { 
    orderId, 
    items, 
    totalAmount, 
    paidAmount,
    dueAmount,
    deliveryCharge,
    mobileBankingFee,
    name, 
    email 
  } = orderData;

  // 🔴 1. Validate Recipient
  if (!email || !email.includes("@")) {
    console.error("❌ Email sending aborted: Invalid recipient.");
    return { success: false, error: "Missing recipient email" };
  }

  // 2. Format Items (Table Rows)
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; color: #3E442B;">
        <span style="font-weight: bold;">${item.productName || item.name}</span><br/>
        <small style="color: #EA638C; font-weight: bold; text-transform: uppercase; font-size: 10px;">
          ${item.variant?.name || ''} ${item.variant?.size || ''}
        </small>
      </td>
      <td style="text-align: center; font-size: 14px; color: #3E442B;">${item.quantity}</td>
      <td style="text-align: right; font-size: 14px; color: #3E442B; font-weight: bold;">৳${item.price.toLocaleString()}</td>
    </tr>
  `).join("");

  // 3. Branded HTML Template
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #FAFAFA; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 30px; overflow: hidden; border: 1px solid #eee; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        
        <div style="background: #3E442B; padding: 40px 20px; text-align: center; border-bottom: 8px solid #EA638C;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 5px; color: #fff; text-transform: uppercase; font-style: italic;">CHARM STORE</h1>
          <p style="font-size: 10px; letter-spacing: 2px; color: #FBB6E6; margin-top: 10px; font-weight: bold; text-transform: uppercase;">Premium Wholesale Registry</p>
        </div>

        <div style="padding: 40px; color: #3E442B;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #666; line-height: 1.6;">Your order <strong>#INV-${orderId.toString().slice(-6).toUpperCase()}</strong> has been successfully registered. Here is your digital receipt.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="text-align: left; color: #999; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #3E442B;">
                <th style="padding-bottom: 12px;">Selection</th>
                <th style="padding-bottom: 12px; text-align: center;">Qty</th>
                <th style="padding-bottom: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background: #f9fafb; padding: 20px; border-radius: 20px; margin-top: 20px;">
            <div style="font-size: 12px; margin-bottom: 8px;">
              <span style="color: #999;">Shipping & Logistics:</span>
              <span style="font-weight: bold; float: right;">৳${(deliveryCharge || 0).toLocaleString()}</span>
              <div style="clear: both;"></div>
            </div>
            
            ${mobileBankingFee > 0 ? `
            <div style="font-size: 12px; margin-bottom: 8px; color: #EA638C;">
              <span>Gateway Service Fee (1.5%):</span>
              <span style="font-weight: bold; float: right;">৳${mobileBankingFee.toLocaleString()}</span>
              <div style="clear: both;"></div>
            </div>` : ''}

            <div style="border-top: 1px dashed #ddd; margin: 10px 0; padding-top: 10px;">
              <span style="font-size: 14px; font-weight: bold;">Grand Total:</span>
              <span style="font-size: 18px; font-weight: bold; color: #3E442B; float: right;">৳${totalAmount.toLocaleString()}</span>
              <div style="clear: both;"></div>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 20px; border-radius: 20px; border: 2px solid ${dueAmount > 0 ? '#FBB6E6' : '#3E442B'}; background: ${dueAmount > 0 ? '#FFF5F8' : '#fff'};">
            <p style="margin: 0; font-size: 11px; font-weight: bold; color: #EA638C; text-transform: uppercase; letter-spacing: 1px;">Payment Summary</p>
            <p style="margin: 8px 0; font-size: 14px; color: #3E442B;">Successfully Paid Online: <strong>৳${(paidAmount || 0).toLocaleString()}</strong></p>
            
            ${dueAmount > 0 ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #FBB6E6;">
                <p style="margin: 0; font-size: 15px; color: #3E442B; font-weight: bold;">
                  Balance Due (COD): <span style="color: #EA638C;">৳${dueAmount.toLocaleString()}</span>
                </p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666; font-style: italic;">Our delivery partner will collect this amount at your doorstep.</p>
              </div>
            ` : `
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #3E442B; font-weight: bold;">
                Status: <span style="color: #22c55e;">Fully Paid ✨</span>
              </p>
            `}
          </div>
        </div>

        <div style="background: #3E442B; padding: 20px; text-align: center; color: #fff; font-size: 10px; letter-spacing: 1px;">
          THIS IS A SYSTEM GENERATED INVOICE • CHARM STORE
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #bbb; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px;">
        High-Quality Wholesale Solutions
      </p>
    </div>
  `;

  // 4. Send Email
  try {
    const result = await transporter.sendMail({
      from: `"Charm Store" <${process.env.EMAIL_USER}>`,
      to: email,
      bcc: process.env.EMAIL_USER, // Keeps a copy for your records
      subject: `Order Confirmed: #INV-${orderId.toString().slice(-6).toUpperCase()}`,
      html: emailHtml,
    });
    
    console.log("✅ Invoice Email Sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    return { success: false, error: error.message };
  }
}