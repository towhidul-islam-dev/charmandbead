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


export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type");
    
    // Check if this is a callback from SSLCommerz (which is a POST x-www-form-urlencoded)
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const status = formData.get("status");
      
      // If the gateway says the payment failed in the POST body
      if (status !== "VALID" && status !== "AUTHENTICATED") {
        return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
      }
      
      return handleCallback(req);
    }

    // ... (Your existing Initial Payment Request logic)
    // Everything else in your POST function looks perfect!
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleCallback(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId || orderId.length > 50 || orderId.includes("{")) {
       return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
    }

    await connectMongoDB();
    
    // 💡 Optimization: Check if already paid to avoid redundant DB writes
    const existingOrder = await Order.findById(orderId);
    if (existingOrder && existingOrder.paymentStatus !== "Paid") {
        await Order.findByIdAndUpdate(orderId, { 
          paymentStatus: "Paid",
          updatedAt: new Date()
        });
        
        // This is where you'd trigger a "New Order" Email to yourself!
    }

    return NextResponse.redirect(
      new URL(`/payment/success?orderId=${orderId}`, req.url),
      303
    );
  } catch (error) {
    return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
  }
}