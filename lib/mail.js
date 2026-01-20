import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// --- 1. ORDER CONFIRMATION ---
export async function sendOrderConfirmationEmail(order) {
  const isPartial = order.dueAmount > 0;
  try {
    await resend.emails.send({
      from: 'Charm Store <onboarding@resend.dev>',
      to: order.shippingAddress.email,
      subject: `Order Confirmed - #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; color: #333;">
          <h1 style="color: #EA638C; font-size: 28px; font-weight: 900;">CHARM STORE</h1>
          <p>Hi ${order.shippingAddress.name.split(' ')[0]}, your order is placed!</p>
          <div style="background: #FFF5F8; padding: 25px; border-radius: 20px; margin: 20px 0; border: 1px solid #FFE4ED;">
            <div style="display: flex; justify-content: space-between;">
              <span>Total Bill:</span> <strong>৳${order.totalAmount}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
              <span>Paid Online:</span> <strong style="color: #16a34a;">৳${order.paidAmount}</strong>
            </div>
            ${isPartial ? `<div style="margin-top: 15px; border-top: 1px dashed #FFD1E1; pt: 15px;">
              <span style="color: #EA638C;">COD BALANCE:</span> <strong style="font-size: 20px;">৳${order.dueAmount}</strong>
            </div>` : ''}
          </div>
        </div>`
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// --- 2. SHIPPING UPDATE ---
export async function sendShippingUpdateEmail(order) {
  try {
    await resend.emails.send({
      from: 'Charm Store <onboarding@resend.dev>',
      to: order.shippingAddress.email,
      subject: `Shipped! #${order._id.toString().slice(-6)}`,
      html: `<div style="text-align: center; font-family: sans-serif; padding: 40px;">
        <h1 style="color: #EA638C;">On its way! 🚚</h1>
        <p>Tracking Number: <strong>${order.trackingNumber}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders/${order._id}" style="background: #EA638C; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none;">Track Order</a>
      </div>`
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// --- 3. BACK IN STOCK ALERT ---
export async function sendStockEmail(email, productName, variantKey, productId) {
  try {
    await resend.emails.send({
      from: 'Charm Store <onboarding@resend.dev>',
      to: email,
      subject: `Restocked: ${productName}! ✨`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; text-align: center;">
          <h1 style="color: #EA638C; font-weight: 900;">CHARM STORE</h1>
          <p style="font-size: 18px;">It's Back!</p>
          <p>The <strong>${productName}</strong> (${variantKey}) you wanted is back in stock.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}" 
               style="background: #EA638C; color: white; padding: 18px 35px; border-radius: 20px; text-decoration: none; font-weight: bold;">
               Buy It Now
            </a>
          </div>
          <p style="font-size: 11px; color: #999;">* High wholesale demand. Grab it before it sells out again!</p>
        </div>`
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// Add this to your lib/mail.js

export async function sendAdminLowStockAlert(productName, variantKey, currentStock, moq) {
  try {
    await resend.emails.send({
      from: 'Charm Store System <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL, // Add your email in .env
      subject: `🚨 URGENT: Low Stock Alert - ${productName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 2px solid #FF5F5F; padding: 40px; border-radius: 30px;">
          <h1 style="color: #FF5F5F; font-size: 20px; font-weight: 900; text-transform: uppercase;">Inventory Warning</h1>
          <p style="font-size: 16px; color: #333;">The following product is almost sold out and may affect wholesale orders:</p>
          
          <div style="background: #FFF0F0; padding: 20px; border-radius: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${productName}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Variant: <strong>${variantKey}</strong></p>
            <hr style="border: none; border-top: 1px solid #FFD6D6; margin: 15px 0;"/>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #FF5F5F; font-weight: 900;">Current Stock: ${currentStock}</span>
              <span style="color: #666;">Min. Order (MOQ): ${moq}</span>
            </div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/products" 
             style="display: block; text-align: center; background: #333; color: white; padding: 15px; border-radius: 15px; text-decoration: none; font-weight: bold;">
             Go to Inventory Manager
          </a>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}