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
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment", "Dhanmondi", 
  "Gulshan", "Jatrabari", "Khilgaon", "Mirpur", "Mohakhali", "Savar","Mohammadpur", 
  "Motijheel", "New Market", "Old Dhaka", "Pallabi", "Rampura", "Uttara"
];

export default function CheckoutPage() {
  const { cart = [], clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userAddress, setUserAddress] = useState(null);
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [stockError, setStockError] = useState(null);
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
  const payableNow = paymentMethod === "COD" ? shippingCharge : finalTotal;
  const dueOnDelivery = paymentMethod === "COD" ? subtotal : 0;

  const handlePlaceOrder = async () => {
    setStockError(null);

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
      
      const orderData = {
        userId: session?.user?.id,
        items: checkoutItems,
        totalAmount: Number(finalTotal),
        paidAmount: Number(payableNow),
        dueAmount: Number(dueOnDelivery),
        deliveryCharge: Number(shippingCharge),
        paymentMethod: paymentMethod,
        phone: phone,
        name: session?.user?.name,
        email: session?.user?.email,
        shippingAddress: userAddress,
      };

      // 1. Create Order & Deduct Stock Atomically
      const result = await createOrder(orderData);

      if (result.success) {
        // 2. Clear local cart
        clearCart();
        localStorage.removeItem("checkoutItems");

        // 3. Trigger SSLCommerz
        const res = await fetch(`/api/payment?orderId=${result.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData: { 
              ...orderData, 
              id: result.orderId,
              amountPaid: Number(payableNow)
            },
          }),
        });

        const payData = await res.json();
        
        if (payData.url) {
          window.location.replace(payData.url);
          return;
        } else {
          toast.error("Payment gateway failed. Please contact support.");
        }
      } else {
        // 🔴 Handle Stock Collision Error
        setStockError(result.message);
        toast.error("Inventory Conflict Detected");
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        {/* 🚨 STOCK ERROR MESSAGE */}
        {stockError && (
          <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-3 bg-red-500 rounded-2xl text-white">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-red-900 uppercase text-xs tracking-widest">Inventory Issue</h3>
              <p className="text-red-600 font-bold text-sm mt-1">{stockError}</p>
              <p className="text-red-400 text-[10px] mt-2 italic font-bold">Try reducing the quantity or selecting another variant.</p>
            </div>
          </div>
        )}

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

          <div className="border-2 border-[#EA638C] p-6 rounded-[2.5rem] bg-[#EA638C]/5 relative overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-lg font-black text-gray-900">{session?.user?.name}</p>
                <p className="text-sm font-bold leading-relaxed text-gray-500">
                  {userAddress ? (
                    `${userAddress.street}, ${userAddress.city}`
                  ) : (
                    <span className="text-red-500 flex items-center gap-1"><AlertCircle size={14}/> Please update your shipping address</span>
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
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "COD" ? "border-[#EA638C] bg-[#EA638C] text-white shadow-lg shadow-pink-100" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm font-black tracking-widest uppercase">Partial COD</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "COD" ? "text-pink-100" : "text-gray-400"}`}>Pay delivery now, items on delivery</span>
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "Online" ? "border-[#EA638C] bg-[#EA638C] text-white shadow-lg shadow-pink-100" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm font-black tracking-widest uppercase">Full Pre-payment</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "Online" ? "text-pink-100" : "text-gray-400"}`}>Pay full amount now</span>
            </button>
          </div>
        </section>

        {/* Item Review */}
        <section className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50">
          <h3 className="mb-6 text-sm font-black tracking-widest text-gray-400 uppercase">Order Details ({checkoutItems.length} items)</h3>
          <div className="space-y-4">
            {checkoutItems.map((item) => (
              <div key={item.uniqueKey} className="flex items-center gap-4 group">
                <div className="relative">
                   <img src={item.imageUrl} className="object-cover border-2 w-16 h-16 border-gray-50 rounded-2xl group-hover:scale-105 transition-transform" alt="" />
                   <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{item.quantity}x</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.color} • {item.size}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</p>
                    <p className="text-[9px] text-gray-400 font-bold">৳{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6 lg:sticky lg:top-32 h-fit">
        <div className="bg-white border-2 border-gray-50 rounded-[3rem] p-8 shadow-2xl shadow-gray-200/50">
          <h2 className="mb-6 text-xl font-black text-gray-800">Checkout Summary</h2>
          
          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-400">
              <span>Items Total</span>
              <span className="text-gray-900">৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-400">
              <span className="flex items-center gap-1"><Truck size={14}/> Delivery ({userAddress?.city || "Detecting..."})</span>
              <span className="text-gray-900">৳{shippingCharge}</span>
            </div>
            <div className="flex items-center justify-between pt-5 text-lg border-t border-gray-100 border-dashed">
              <span className="font-black text-gray-800">Total Bill</span>
              <span className="font-black text-gray-900 text-2xl">৳{finalTotal}</span>
            </div>
          </div>

          <div className="bg-[#EA638C]/5 rounded-[2rem] p-6 mb-8 border border-[#EA638C]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-[#EA638C] tracking-[0.2em]">Payable Now</span>
              <span className="text-2xl font-black text-[#EA638C]">৳{payableNow}</span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex justify-between items-center pt-3 border-t border-[#EA638C]/10 mt-3">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Remaining (COD)</span>
                <span className="font-black text-gray-600">৳{dueOnDelivery}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-[#EA638C] text-white p-2.5 pr-8 rounded-full font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group disabled:bg-gray-300 shadow-lg shadow-pink-200 active:scale-95"
          >
            <div className="bg-white p-3.5 rounded-full text-[#EA638C] shadow-sm">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            </div>
            <span className="flex-1 text-center font-black">
              {loading ? "Verifying Inventory..." : `Proceed to Pay ৳${payableNow}`}
            </span>
          </button>
          
          <p className="text-[9px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest">
            Secure 256-bit SSL Encrypted Payment
          </p>
        </div>
      </div>
    </div>
  );
}