// 1. Customer Confirmation Email
export function getCustomerOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #FBB6E6; border-radius: 12px; padding: 24px; background-color: #ffffff;">
      <h2 style="color: #EA638C; margin-top: 0;">Thank You for Your Order! 🎉</h2>
      <p style="font-size: 15px; color: #333;">Hello <strong>${order.customerName}</strong>,</p>
      <p style="font-size: 15px; color: #333;">We have received your order <strong>#${order.orderId}</strong> and are currently processing it.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #3E442B; color: #ffffff;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 16px; margin-bottom: 20px;">
        <strong>Total Amount: ৳${order.totalAmount}</strong>
      </div>

      <p style="font-size: 14px; color: #555;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.orderId}" 
           style="background-color: #EA638C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Your Order
        </a>
      </div>
    </div>
  `;
}

// 2. Admin New Order Notification Email
export function getAdminOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #FBB6E6; border-radius: 12px; padding: 24px; background-color: #ffffff;">
      <h2 style="color: #3E442B; margin-top: 0;">🚨 New Order Received!</h2>
      <p style="font-size: 15px; color: #333;">
        Hey <strong>Charm & Beads</strong>, you received a new order from <strong>${order.customerName}</strong>.
      </p>

      <!-- Customer Details Box -->
      <div style="background-color: #fdf5f8; border-left: 4px solid #EA638C; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #3E442B;">Customer Information</h4>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${order.customerName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${order.customerEmail}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${order.shippingAddress || 'N/A'}</p>
      </div>

      <!-- Order Details -->
      <h4 style="color: #3E442B; margin-bottom: 8px;">Order Details (#${order.orderId})</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #3E442B; color: #ffffff;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 16px; margin-bottom: 20px;">
        <strong>Total Amount: ৳${order.totalAmount}</strong>
      </div>

      <p style="font-size: 14px; color: #555;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders" 
           style="background-color: #EA638C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View in Admin Dashboard
        </a>
      </div>
    </div>
  `;
}

// 3. Dynamic Customer Order Status Update Email
export function getStatusUpdateEmailHtml(order) {
  const { newStatus, trackingNumber, orderId, customerName, totalAmount, items = [] } = order;

  // Status configuration mappings using brand colors
  let statusConfig = {
    badgeBg: "#3E442B",
    badgeText: "STATUS UPDATE",
    heading: "Order Status Update",
    message: `The status of your order <strong>#${orderId}</strong> has been updated to <strong>${newStatus}</strong>.`,
    extraDetailsHtml: ""
  };

  switch (newStatus) {
    case "Payment Received":
      statusConfig = {
        badgeBg: "#3E442B",
        badgeText: "PAYMENT CONFIRMED",
        heading: "Payment Verified! 💳",
        message: `We've verified your payment for Order <strong>#${orderId}</strong>. We are now preparing your items for packaging.`,
        extraDetailsHtml: `
          <div style="background-color: #fdf5f8; border-left: 4px solid #3E442B; padding: 14px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; color: #333;"><strong>What's Next?</strong> Our team is hand-crafting and carefully packing your order. We'll notify you as soon as it ships!</p>
          </div>
        `
      };
      break;

    case "Shipped":
      statusConfig = {
        badgeBg: "#EA638C",
        badgeText: "DISPATCHED",
        heading: "Your Order is On the Way! 🚚",
        message: `Great news! Order <strong>#${orderId}</strong> has been handed over to our delivery partner.`,
        extraDetailsHtml: `
          <div style="background-color: #fdf5f8; border-left: 4px solid #EA638C; padding: 14px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #3E442B;"><strong>Tracking Details</strong></p>
            <p style="margin: 0; font-size: 14px; color: #333;">
              <strong>Tracking Code:</strong> ${trackingNumber || 'Tracking details sent via SMS by delivery partner'}
            </p>
          </div>
        `
      };
      break;

    case "Delivered":
      statusConfig = {
        badgeBg: "#3E442B",
        badgeText: "DELIVERED",
        heading: "Package Delivered! ✨",
        message: `Your order <strong>#${orderId}</strong> has been delivered. We hope you enjoy your new items!`,
        extraDetailsHtml: `
          <div style="background-color: #fdf5f8; border-left: 4px solid #EA638C; padding: 14px; margin: 20px 0; border-radius: 6px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #333;">Loved your experience?</p>
            <p style="margin: 0; font-size: 13px; color: #555;">Share your feedback or tag us on social media!</p>
          </div>
        `
      };
      break;

    case "Cancelled":
      statusConfig = {
        badgeBg: "#d9534f",
        badgeText: "CANCELLED",
        heading: "Order Cancelled ❌",
        message: `Your order <strong>#${orderId}</strong> has been cancelled. If you have any questions regarding refunds or order changes, please reach out to our support team.`,
        extraDetailsHtml: ""
      };
      break;

    default:
      break;
  }

  const itemsHtml = items.length > 0
    ? items.map(item => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">৳${item.price}</td>
        </tr>
      `).join('')
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #FBB6E6; border-radius: 12px; padding: 24px; background-color: #ffffff;">
      <div style="margin-bottom: 16px;">
        <span style="background-color: ${statusConfig.badgeBg}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
          ${statusConfig.badgeText}
        </span>
      </div>

      <h2 style="color: #3E442B; margin-top: 8px; font-size: 22px;">${statusConfig.heading}</h2>
      <p style="font-size: 15px; color: #333; line-height: 1.5;">Hello <strong>${customerName}</strong>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.5;">${statusConfig.message}</p>

      ${statusConfig.extraDetailsHtml}

      ${itemsHtml ? `
        <h4 style="color: #3E442B; margin: 20px 0 10px 0;">Order Summary</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #3E442B; color: #ffffff;">
              <th style="padding: 8px 10px; text-align: left; font-size: 13px;">Item</th>
              <th style="padding: 8px 10px; text-align: center; font-size: 13px;">Qty</th>
              <th style="padding: 8px 10px; text-align: right; font-size: 13px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ${totalAmount ? `
          <div style="text-align: right; font-size: 15px; font-weight: bold; color: #333; margin-bottom: 20px;">
            Total: ৳${totalAmount}
          </div>
        ` : ''}
      ` : ''}

      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderId}" 
           style="background-color: #EA638C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Order Details
        </a>
      </div>
    </div>
  `;
}