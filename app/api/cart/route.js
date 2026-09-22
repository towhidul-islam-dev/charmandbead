import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; 
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// GET: Fetch cart for logged-in user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const cartDoc = await Cart.findOne({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      items: cartDoc ? cartDoc.items : [],
    });
  } catch (error) {
    console.error("CART_GET_ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Save or overwrite cart for logged-in user
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Invalid cart items format" }, { status: 400 });
    }

    // Comprehensive sanitization to ensure all Mongoose schema fields are preserved
    const sanitizedItems = items.map(item => {
      const pId = (item.productId?.$oid || item.productId || "").toString();
      const vId = (item.variantId?.$oid || item.variantId || null)?.toString();
      const calculatedPrice = Number(item.price || item.basePrice || 0);

      return {
        productId: pId,
        variantId: vId === "std" || !vId ? null : vId,
        uniqueKey: item.uniqueKey || `${pId}-${vId || "std"}`,
        name: item.name || "Product",
        variantName: item.variantName || "",
        basePrice: Number(item.basePrice || calculatedPrice),
        price: calculatedPrice,
        pricingTiers: item.pricingTiers || [],
        imageUrl: item.imageUrl || item.image || "/placeholder.png",
        size: item.size || "N/A",
        color: item.color || "Default",
        minOrderQuantity: Number(item.minOrderQuantity) || 1,
        stock: Number(item.stock) || 0,
        quantity: Math.max(Number(item.quantity) || 1, Number(item.minOrderQuantity) || 1),
        sku: item.sku || "N/A",
      };
    });

    await dbConnect();

    // Upsert the user's cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items: sanitizedItems },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      items: updatedCart.items,
    });
  } catch (error) {
    console.error("CART_POST_ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}