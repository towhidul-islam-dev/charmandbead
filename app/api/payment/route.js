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
    const body = await req.json();
    // 🛡️ Destructure exactly what the frontend sends
    const { orderId, amount, customerName, customerEmail } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = {
      store_id: STORE_ID,
      store_passwd: STORE_PASSWORD,
      total_amount: amount,
      currency: "BDT",
      tran_id: orderId,
      success_url: `${process.env.NEXTAUTH_URL}/api/payment/callback?orderId=${orderId}`,
      fail_url: `${process.env.NEXTAUTH_URL}/payment/failed`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
      ipn_url: `${process.env.NEXTAUTH_URL}/api/payment/ipn`,
      shipping_method: "NO",
      product_name: "Charm & Bead Order",
      product_category: "Jewelry",
      product_profile: "general",
      cus_name: customerName,
      cus_email: customerEmail,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    };

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
    });

    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: "Gateway Parse Error", raw: responseText }, { status: 502 });
    }

    if (result.status === "SUCCESS" && result.GatewayPageURL) {
      return NextResponse.json({ url: result.GatewayPageURL });
    } else {
      return NextResponse.json({ 
        error: "Gateway Rejected Request", 
        details: result.failedreason || "Unknown" 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("PAYMENT_API_CRASH:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}