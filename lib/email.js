import { Resend } from "resend";
import { 
  getCustomerOrderEmailHtml, 
  getAdminOrderEmailHtml,
  getStatusUpdateEmailHtml
} from "@/lib/emailTemplates";

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) {
  console.warn("⚠️ [Mailer Warning] RESEND_API_KEY is not defined in environment variables.");
}

const resend = new Resend(resendKey);

export async function sendOrderEmail({ to, orderData }) {
  if (!resendKey) {
    const errorMsg = "Email delivery aborted: Missing RESEND_API_KEY.";
    console.error(`❌ [Mailer Error] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

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
    const safeOrderData = {
      ...orderData,
      orderId: orderData?.orderId || orderData?._id || "N/A",
      customerName: orderData?.customerName || "Customer",
      items: Array.isArray(orderData?.items) ? orderData.items : []
    };

    // 1. Render Customer Email HTML
    let customerHtml = "";
    try {
      customerHtml = safeOrderData.isStatusUpdate
        ? getStatusUpdateEmailHtml(safeOrderData)
        : getCustomerOrderEmailHtml(safeOrderData);
    } catch (templateErr) {
      console.error("❌ [Mailer Error] Failed to render customer email template:", templateErr);
      return { success: false, error: `Customer Template Error: ${templateErr.message}` };
    }

    const customerText = customerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    console.log(`✉️ [Mailer] Sending customer email to: ${to.trim()}`);

    // Send Customer Email
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
      console.error(`❌ [Mailer Error] Resend API error (Customer):`, customerResult.error);
      return { success: false, error: customerResult.error.message || "Resend API rejected customer email." };
    }

    console.log(`✅ [Mailer Success] Customer Email sent | MessageID: ${customerResult.data?.id}`);

    // 2. Send Admin Notification Email on NEW orders
    if (process.env.ADMIN_EMAIL && !safeOrderData.isStatusUpdate) {
      const adminEmail = process.env.ADMIN_EMAIL.trim();
      let adminHtml = "";

      try {
        adminHtml = getAdminOrderEmailHtml(safeOrderData);
      } catch (templateErr) {
        console.error("❌ [Mailer Error] Failed to render admin email template:", templateErr);
        // Customer email was sent successfully; log admin template error without failing entire action
      }

      if (adminHtml) {
        const adminText = adminHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        console.log(`✉️ [Mailer] Sending admin email to: ${adminEmail}`);

        const adminResult = await resend.emails.send({
          from: senderEmail,
          to: [adminEmail],
          subject: `🚨 New Order #${safeOrderData.orderId} from ${safeOrderData.customerName}`,
          text: adminText,
          html: adminHtml,
        });

        if (adminResult.error) {
          console.error(`❌ [Mailer Error] Resend API error (Admin):`, adminResult.error);
        } else {
          console.log(`✅ [Mailer Success] Admin Email sent | MessageID: ${adminResult.data?.id}`);
        }
      }
    }

    return { success: true, messageId: customerResult.data?.id };
  } catch (error) {
    console.error(`❌ [Mailer Failure] Exception thrown:`, error?.message || error);
    return { success: false, error: error?.message || "Unknown mailer error" };
  }
}