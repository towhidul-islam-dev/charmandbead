import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectMongoDB();

    // 1. Extract Order ID from the URL query parameter we set in the success_url
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    // 2. SSLCommerz sends payment status in the body as Form Data
    const formData = await req.formData();
    const status = formData.get("status");

    // 3. Logic for successful payment
    if (status === "VALID" || status === "AUTHENTICATED") {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Paid",
        status: "Processing", // Moves from 'Pending' to 'Processing'
        // Optional: Save transaction details for your records
        paymentDetails: {
          val_id: formData.get("val_id"),
          card_type: formData.get("card_type"),
          bank_tran_id: formData.get("bank_tran_id"),
        }
      });

      console.log(`✅ Payment successful for Order: ${orderId}`);

      // 4. Redirect to your beautiful Success Page with the Order ID
      // Status 303 ensures the browser switches from POST to GET
      return NextResponse.redirect(
        new URL(`/payment/success?orderId=${orderId}`, req.url), 
        303
      );
    } 
    
    // 5. Logic for failed/cancelled payment
    else {
      console.log(`❌ Payment failed for Order: ${orderId}. Status: ${status}`);
      return NextResponse.redirect(
        new URL(`/payment/failed?orderId=${orderId}`, req.url), 
        303
      );
    }
  } catch (error) {
    console.error("CALLBACK_ERROR:", error);
    // Fallback redirect if something crashes during DB update
    return NextResponse.redirect(new URL("/payment/failed", req.url), 303);
  }
}