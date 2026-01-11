"use client";
import { useState, useEffect } from "react"; 
import { useCart } from "@/Context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/order";
import { getUserAddress } from "@/actions/userActions"; 
import toast from "react-hot-toast";
import Link from "next/link";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  Loader2,
  Phone,
  Truck,
} from "lucide-react";

const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment", "Dhanmondi", 
  "Gulshan", "Jatrabari", "Khilgaon", "Mirpur", "Mohakhali", "Savar","Mohammadpur", 
  "Motijheel", "New Market", "Old Dhaka", "Pallabi", "Rampura", "Uttara"
];

export default function CheckoutPage() {
  const { cart = [] } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userAddress, setUserAddress] = useState(null);
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  // 💡 Default shipping fallback
  const [shippingCharge, setShippingCharge] = useState(130); 

  useEffect(() => {
    async function initCheckout() {
      // 1. Load Items
      const saved = localStorage.getItem("checkoutItems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setCheckoutItems(parsed);
        else router.push("/cart");
      } else {
        if (cart.length > 0) setCheckoutItems(cart);
        else if (status !== "loading") router.push("/cart");
      }

      // 2. Load User Address & Calculate Shipping
      if (session?.user?.email) {
        const response = await getUserAddress();
        if (response?.success && response.address) {
          setUserAddress(response.address);
          setPhone(response.address.phone || "");

          const city = response.address.city || "";
          const isInsideDhaka = DHAKA_ZONES.some(zone => 
            city.toLowerCase().includes(zone.toLowerCase()) || 
            city.toLowerCase() === "dhaka"
          );
          setShippingCharge(isInsideDhaka ? 80 : 130);
        }
      }
      setIsInitializing(false);
    }
    initCheckout();
  }, [cart, router, status, session]);

  // --- MATH LOGIC ---
  const subtotal = checkoutItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const finalTotal = subtotal + shippingCharge;
  
  // 💡 Partial vs Full logic
  const payableNow = paymentMethod === "COD" ? shippingCharge : finalTotal;
  const dueOnDelivery = paymentMethod === "COD" ? subtotal : 0;

const handlePlaceOrder = async () => {
    if (status === "unauthenticated") {
      toast.error("Please login to place an order");
      router.push("/login?callbackUrl=/dashboard/checkout");
      return;
    }

    if (!userAddress) {
      toast.error("Please add a shipping address in your profile first");
      return;
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phone || !bdPhoneRegex.test(phone)) {
      toast.error("Valid BD phone number is required");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Prepare data for Database
      const orderData = {
        userId: session?.user?.id,
        items: checkoutItems,
        totalAmount: Number(finalTotal),
        paidAmount: Number(payableNow),   // This is what the user pays NOW
        dueAmount: Number(dueOnDelivery), // This is the COD balance
        deliveryCharge: Number(shippingCharge),
        paymentMethod: paymentMethod,
        phone: phone,
        name: session?.user?.name,
        email: session?.user?.email,
        shippingAddress: userAddress,
      };

      // 2. Create Order in MongoDB
      const result = await createOrder(orderData);

      if (result.success) {
        // 3. Trigger SSLCommerz
        // We pass 'paidAmount' as 'amountPaid' to satisfy your API's req.json() check
        const res = await fetch(`/api/payment?orderId=${result.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData: { 
              ...orderData, 
              id: result.orderId,
              amountPaid: Number(payableNow) // Explicitly set for the API route
            },
          }),
        });

        const payData = await res.json();
        
        if (payData.url) {
          // Redirect to SSLCommerz Gateway
          window.location.replace(payData.url);
          return;
        } else {
          console.error("Gateway Error:", payData);
          toast.error(payData.error || "Payment gateway failed to initialize");
        }
      } else {
        toast.error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  return (
    <div className="relative grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 pt-32 mx-auto lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        {/* Shipping & Contact */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 mb-4 text-xl font-black text-gray-800">
            <MapPin className="text-[#EA638C]" /> Shipping & Contact
          </h2>

          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EA638C] transition-colors">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-16 p-6 rounded-[2rem] border-2 border-gray-100 focus:border-[#EA638C] bg-white outline-none font-bold text-gray-700 transition-all shadow-sm"
            />
          </div>

          <div className="border-2 border-[#EA638C] p-6 rounded-[2.5rem] bg-[#EA638C]/5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-lg font-black text-gray-900">{session?.user?.name}</p>
                <p className="text-sm font-bold leading-relaxed text-gray-500">
                  {userAddress ? (
                    `${userAddress.street}, ${userAddress.city}`
                  ) : (
                    <span className="text-red-500">Address not found</span>
                  )}
                </p>
              </div>
              <Link href="/dashboard/address" className="text-center text-[10px] font-black uppercase text-[#EA638C] bg-white px-5 py-2 rounded-full border border-pink-100 hover:bg-pink-50 transition-colors">
                Edit Address
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Selection */}
        <section>
          <h2 className="flex items-center gap-2 mb-4 text-xl font-black text-gray-800">
            <CreditCard className="text-[#EA638C]" /> Payment Plan
          </h2>
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`p-6 rounded-[2rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "COD" ? "border-[#EA638C] bg-[#EA638C] text-white" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm font-black tracking-widest uppercase">Partial COD</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "COD" ? "text-pink-100" : "text-gray-400"}`}>Pay delivery now, items on delivery</span>
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`p-6 rounded-[2rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "Online" ? "border-[#EA638C] bg-[#EA638C] text-white" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm font-black tracking-widest uppercase">Full Pre-payment</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "Online" ? "text-pink-100" : "text-gray-400"}`}>Pay full amount now</span>
            </button>
          </div>
        </section>

        {/* Item Review */}
        <section className="bg-white rounded-[2rem] p-6 border-2 border-gray-50">
          <h3 className="mb-4 text-sm font-black tracking-widest text-gray-400 uppercase">Order Details</h3>
          <div className="space-y-3">
            {checkoutItems.map((item) => (
              <div key={item.uniqueKey} className="flex items-center gap-4">
                <img src={item.imageUrl} className="object-cover border-2 w-14 h-14 border-gray-50 rounded-2xl" alt="" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{item.color} • {item.size}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6 lg:sticky lg:top-32 h-fit">
        <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100">
          <h2 className="mb-6 text-xl font-black text-gray-800">Order Summary</h2>
          
          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-400">
              <span>Items Subtotal</span>
              <span className="text-gray-900">৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-400">
              <span className="flex items-center gap-1"><Truck size={14}/> Shipping ({userAddress?.city || "Detecting..."})</span>
              <span className="text-gray-900">৳{shippingCharge}</span>
            </div>
            <div className="flex items-center justify-between pt-4 text-lg border-t border-gray-100 border-dashed">
              <span className="font-black text-gray-800">Grand Total</span>
              <span className="font-black text-gray-900">৳{finalTotal}</span>
            </div>
          </div>

          {/* Payment Breakdown Card */}
          <div className="bg-[#EA638C]/5 rounded-[1.5rem] p-5 mb-8 border border-[#EA638C]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-[#EA638C] tracking-widest">Payable Now</span>
              <span className="text-xl font-black text-[#EA638C]">৳{payableNow}</span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex justify-between items-center pt-2 border-t border-[#EA638C]/10 mt-2">
                <span className="text-[10px] font-black uppercase text-gray-400">Cash on Delivery</span>
                <span className="font-black text-gray-600">৳{dueOnDelivery}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-[#EA638C] text-white p-2 pr-8 rounded-full font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group disabled:bg-gray-300"
          >
            <div className="bg-white p-3 rounded-full text-[#EA638C]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            </div>
            <span className="flex-1 text-center">
              {loading ? "Processing..." : `Secure Checkout ৳${payableNow}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}