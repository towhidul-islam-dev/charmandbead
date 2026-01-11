import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(order) {
  const isPartial = order.dueAmount > 0;

  try {
    await resend.emails.send({
      from: 'Charm Store <onboarding@resend.dev>', // Replace with your verified domain later
      to: order.shippingAddress.email,
      subject: `Order Confirmed - #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 30px; color: #333;">
          <h1 style="color: #EA638C; margin-bottom: 5px; font-size: 28px; font-weight: 900;">CHARM STORE</h1>
          <p style="font-size: 16px; color: #666;">Hi ${order.shippingAddress.name.split(' ')[0]},</p>
          <p style="font-size: 16px;">Your order has been placed successfully and is being processed.</p>
          
          <div style="background: #FFF5F8; padding: 25px; border-radius: 20px; margin: 30px 0; border: 1px solid #FFE4ED;">
            <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #EA638C; letter-spacing: 2px;">Payment Details</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Total Bill:</span>
              <strong style="color: #333;">৳${order.totalAmount.toLocaleString()}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Paid Online:</span>
              <strong style="color: #16a34a;">৳${order.paidAmount.toLocaleString()}</strong>
            </div>
            
            ${isPartial ? `
              <div style="border-top: 2px dashed #FFD1E1; margin-top: 15px; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #EA638C; font-weight: bold;">CASH ON DELIVERY:</span>
                  <span style="color: #EA638C; font-size: 24px; font-weight: 900;">৳${order.dueAmount.toLocaleString()}</span>
                </div>
                <p style="font-size: 11px; color: #D14D72; font-style: italic; margin-top: 10px; line-height: 1.4;">
                  * Since this is a partial payment, please pay the remaining balance to the delivery agent.
                </p>
              </div>
            ` : `
              <div style="border-top: 2px dashed #D1FAE5; margin-top: 15px; padding-top: 15px;">
                <strong style="color: #16a34a; text-transform: uppercase; font-size: 12px;">Paid In Full - No COD Required</strong>
              </div>
            `}
          </div>

          <div style="margin-top: 30px;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Shipping To:</h3>
            <p style="font-size: 14px; color: #555; line-height: 1.5;">
              ${order.shippingAddress.name}<br/>
              ${order.shippingAddress.phone}<br/>
              ${order.shippingAddress.address}
            </p>
          </div>
          
          <p style="font-size: 11px; color: #BBB; margin-top: 40px; text-align: center;">Order ID: ${order._id}</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
// lib/mail.js (Add this below your other function)

export async function sendShippingUpdateEmail(order) {
  try {
    await resend.emails.send({
      from: 'Charm Store <onboarding@resend.dev>',
      to: order.shippingAddress.email,
      subject: `Your Order #${order._id.toString().slice(-6)} has shipped!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 24px; text-align: center;">
          <h1 style="color: #EA638C;">On its way! 🚚</h1>
          <p style="font-size: 16px; color: #555;">Great news! Your package is officially on the move.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #999;">Tracking Number</p>
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${order.trackingNumber}</p>
          </div>

          <a href="https://yourstore.com/dashboard/orders/${order._id}" 
             style="display: inline-block; background: #EA638C; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0;">
             Track Your Order
          </a>

          <p style="font-size: 13px; color: #888;">
            If you have a remaining COD balance of <strong>৳${order.dueAmount}</strong>, please have it ready for the delivery person.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Shipping Email Error:", error);
    return { success: false };
  }
}