import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Order from "@/models/Order";

const STORE_ID = process.env.SSL_STORE_ID;
const STORE_PASSWORD = process.env.SSL_STORE_PASSWORD;
const IS_SANDBOX = process.env.SSL_IS_SANDBOX === "true";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
  : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type");

    // 1. Handle Callback from SSLCommerz (Gateway sends Form Data)
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      return handleCallback(req);
    }

    // 2. Initial Payment Request (Frontend sends JSON)
    const body = await req.json();
    const { orderData } = body;
    
    if (!orderData || !orderData.id) {
        return NextResponse.json({ error: "Missing Order Data" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const formData = new URLSearchParams();
    formData.append("store_id", STORE_ID);
    formData.append("store_passwd", STORE_PASSWORD);
    formData.append("total_amount", Number(orderData.totalAmount || orderData.amountPaid).toFixed(2));
    formData.append("currency", "BDT");
    
    // Unique ID logic to prevent "TOKEN_EXPIRED / INVALID_ARGUMENT"
    const uniqueTranId = `${orderData.id}_${Date.now()}`;
    formData.append("tran_id", uniqueTranId);

    // IMPORTANT: Redirecting to the UI folder, NOT the API folder
    formData.append("success_url", `${baseUrl}/api/payment?orderId=${orderData.id}`);
    formData.append("fail_url", `${baseUrl}/payment/failed`);
    formData.append("cancel_url", `${baseUrl}/checkout`);
    formData.append("ipn_url", `${baseUrl}/api/ipn`);

    // Customer Info
    formData.append("cus_name", orderData.name || "Customer");
    formData.append("cus_email", orderData.email || "customer@mail.com");
    formData.append("cus_add1", orderData.address || "Dhaka");
    formData.append("cus_phone", orderData.phone || "01700000000");
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
        { error: result?.failedreason || "Gateway Error" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleCallback(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    // VALIDATION: Ensure orderId is a clean string, not an object
    if (!orderId || orderId.includes("{")) {
       return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
    }

    await connectMongoDB();
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid" });

    // REDIRECT TO THE UI PAGE (app/payment/success/page.js)
    return NextResponse.redirect(
      new URL(`/payment/success?orderId=${orderId}`, req.url),
      303
    );
  } catch (error) {
    console.error("Callback Error:", error);
    return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
  }
}

export async function GET(req) {
  return handleCallback(req);
}