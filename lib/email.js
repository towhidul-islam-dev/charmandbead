import { Resend } from "resend";
import { 
  getCustomerOrderEmailHtml, 
  getAdminOrderEmailHtml,
  getStatusUpdateEmailHtml
} from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail({ to, orderData }) {
  if (!to || typeof to !== "string" || !to.includes("@")) {
    const errorMsg = `Email delivery aborted: Invalid recipient address provided -> "${to}"`;
    console.error(`❌ [Mailer Error] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) {
    const errorMsg = "Email delivery aborted: Missing process.env.SENDER_EMAIL in environment variables.";
    console.error(`❌ [Mailer Error] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  try {
    // Safely fallback items to empty array if missing (e.g. during status updates)
    const safeOrderData = {
      ...orderData,
      items: Array.isArray(orderData?.items) ? orderData.items : []
    };

    // 1. Dynamically select template based on order flow (New Order vs Status Update)
    const customerHtml = safeOrderData.isStatusUpdate
      ? getStatusUpdateEmailHtml(safeOrderData)
      : getCustomerOrderEmailHtml(safeOrderData);

    const customerText = customerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    console.log(`✉️ [Mailer] Attempting to send customer email to: ${to.trim()}`);

    const customerResult = await resend.emails.send({
      from: senderEmail,
      to: [to.trim()],
      subject: safeOrderData.isStatusUpdate 
        ? `${safeOrderData.statusTitle || 'Order Status Update'} - #${safeOrderData.orderId}`
        : `Thank You for Your Order! - #${safeOrderData.orderId}`,
      text: customerText,
      html: customerHtml,
    });

    if (customerResult.error) {
      console.error(`❌ [Mailer Error] Resend API error (Customer): ${customerResult.error.message}`);
    } else {
      console.log(`✅ [Mailer Success] Customer Email sent | MessageID: ${customerResult.data.id}`);
    }

    // 2. Send Admin Notification Email ONLY on NEW orders (not on status updates)
    if (process.env.ADMIN_EMAIL && !safeOrderData.isStatusUpdate) {
      const adminEmail = process.env.ADMIN_EMAIL.trim();
      const adminHtml = getAdminOrderEmailHtml(safeOrderData);
      const adminText = adminHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      console.log(`✉️ [Mailer] Attempting to send admin email to: ${adminEmail}`);

      const adminResult = await resend.emails.send({
        from: senderEmail,
        to: [adminEmail],
        subject: `🚨 New Order #${safeOrderData.orderId} from ${safeOrderData.customerName}`,
        text: adminText,
        html: adminHtml,
      });

      if (adminResult.error) {
        console.error(`❌ [Mailer Error] Resend API error (Admin): ${adminResult.error.message}`);
      } else {
        console.log(`✅ [Mailer Success] Admin Email sent | MessageID: ${adminResult.data.id}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`❌ [Mailer Failure] Failed to send emails:`, error.message);
    return { success: false, error: error.message };
  }
}