import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Order from "@/models/Order";

// Ensure variables are correctly loaded
const STORE_ID = process.env.SSL_STORE_ID;
const STORE_PASSWORD = process.env.SSL_STORE_PASSWORD;
const IS_SANDBOX = process.env.SSL_IS_SANDBOX === "true";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
  : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

// ... (keep your imports and config)

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      return handleCallback(req);
    }

    const body = await req.json();
    const { orderData } = body;
    
    if (!orderData || !orderData.id) {
        return NextResponse.json({ error: "Missing Order Data" }, { status: 400 });
    }

    // 💡 FIX: Ensure we get the correct amount. 
    // Check for 'paidAmount' OR 'amountPaid' OR 'totalAmount'
    const finalAmount = orderData.paidAmount || orderData.amountPaid || orderData.amount;
    
    // Safety check: if amount is 0 or NaN, SSLCommerz will fail
    if (!finalAmount || isNaN(finalAmount)) {
        console.error("❌ Invalid Amount Received:", finalAmount);
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const formData = new URLSearchParams();
    formData.append("store_id", STORE_ID);
    formData.append("store_passwd", STORE_PASSWORD);
    
    // 💡 TOFIXED: SSLCommerz requires a string representing a number with 2 decimals
    formData.append("total_amount", parseFloat(finalAmount).toFixed(2));
    formData.append("currency", "BDT");
    
    // Unique Transaction ID
    const uniqueTranId = `${orderData.id}_${Date.now()}`;
    formData.append("tran_id", uniqueTranId);

    formData.append("success_url", `${baseUrl}/api/payment?orderId=${orderData.id}`);
    formData.append("fail_url", `${baseUrl}/payment/failed`);
    formData.append("cancel_url", `${baseUrl}/checkout`);
    formData.append("ipn_url", `${baseUrl}/api/ipn`);

    // Customer Info (Ensure these aren't empty)
    formData.append("cus_name", orderData.name?.trim() || "Customer");
    formData.append("cus_email", orderData.email?.trim() || "customer@mail.com");
    formData.append("cus_add1", orderData.address?.trim() || "Dhaka");
    formData.append("cus_phone", orderData.phone?.trim() || "01700000000");
    formData.append("cus_city", "Dhaka");
    formData.append("cus_postcode", "1000");
    formData.append("cus_country", "Bangladesh");

    // Product Info
    formData.append("shipping_method", "NO");
    formData.append("product_name", "Construction_Materials");
    formData.append("product_category", "General");
    formData.append("product_profile", "general");

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result?.status === "SUCCESS" && result?.GatewayPageURL) {
      return NextResponse.json({ url: result.GatewayPageURL });
    } else {
      console.error("❌ SSLCommerz Error Response:", result);
      return NextResponse.json(
        { error: result?.failedreason || "Gateway Error", details: result },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// ... (keep your handleCallback function)

async function handleCallback(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    // VALIDATION: If orderId is too long or looks like an object string, stop immediately
    if (!orderId || orderId.length > 50 || orderId.includes("{")) {
       console.error("❌ Invalid OrderId received:", orderId);
       return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
    }

    await connectMongoDB();
    
    // This will now only run if orderId is a clean string
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid" });

    return NextResponse.redirect(
      new URL(`/payment/success?orderId=${orderId}`, req.url),
      303
    );
  } catch (error) {
    console.error("Callback Mongoose Error:", error.message);
    return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
  }
}