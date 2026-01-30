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
  Info,
} from "lucide-react";

const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment", "Dhanmondi", 
  "Gulshan", "Jatrabari", "Khilgaon", "Mirpur", "Mohakhali", "Savar","Mohammadpur", 
  "Motijheel", "New Market", "Old Dhaka", "Pallabi", "Rampura", "Uttara"
];

export default function CheckoutPage() {
  const { cart = [] } = useCart(); // Note: clearCart removed from here, handled on Success Page
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
      const saved = localStorage.getItem("checkoutItems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setCheckoutItems(parsed);
        else router.push("/cart");
      } else {
        if (cart.length > 0) setCheckoutItems(cart);
        else if (status !== "loading") router.push("/cart");
      }

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
  const baseForFee = paymentMethod === "COD" ? shippingCharge : finalTotal;
  const mobileBankingFee = baseForFee * 0.015;
  const payableNow = baseForFee + mobileBankingFee;
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
      
      const mappedItems = checkoutItems.map(item => {
        const productId = item.productId || item._id; 
        const variantId = item.variantId || null;

        return {
          product: productId, 
          name: item.name,
          variant: { 
            name: item.color || "Default", 
            size: item.size || "N/A",
            variantId: variantId 
          },
          variantId: variantId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          imageUrl: item.imageUrl,
          sku: item.sku || "N/A"
        };
      });

      const orderData = {
        userId: session?.user?.id,
        items: mappedItems,
        totalAmount: Number((finalTotal + mobileBankingFee).toFixed(2)), 
        paidAmount: Number(payableNow.toFixed(2)),
        dueAmount: Number(dueOnDelivery.toFixed(2)), 
        deliveryCharge: Number(shippingCharge),
        paymentMethod: paymentMethod,
        mobileBankingFee: Number(mobileBankingFee.toFixed(2)), 
        phone: phone,
        name: session?.user?.name,
        email: session?.user?.email,
        shippingAddress: userAddress,
        stockProcessed: false, // 🟢 Inform Success Page to handle inventory
      };

      const result = await createOrder(orderData);

      if (result.success) {
        // 🟢 Logic: We leave the cart and localStorage alone here.
        // The Success Page will "surgically" remove the items after payment verification.

        const res = await fetch(`/api/payment?orderId=${result.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData: { 
              ...orderData, 
              id: result.orderId,
              amountPaid: Number(payableNow.toFixed(2))
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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  return (
    <div className="relative grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 pt-32 mx-auto lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        
        {/* Error Alert Box - Brand Pink Styling */}
        {stockError && (
          <div className="p-6 bg-red-50 border-2 border-[#EA638C]/20 rounded-[2.5rem] flex items-start gap-4 shadow-sm">
            <div className="p-3 text-white bg-[#EA638C] rounded-2xl"><AlertCircle size={24} /></div>
            <div>
              <h3 className="text-xs font-black tracking-widest text-[#3E442B] uppercase">Inventory Notice</h3>
              <p className="mt-1 text-sm font-bold text-gray-600">{stockError}</p>
            </div>
          </div>
        )}

        <section className="space-y-6">
          <h2 className="flex items-center gap-2 mb-4 text-xl font-black text-[#3E442B] uppercase italic">
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

          <div className="border-2 border-[#3E442B] p-6 rounded-[2.5rem] bg-[#3E442B]/5 relative overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-lg font-black text-[#3E442B]">{session?.user?.name}</p>
                <p className="text-sm font-bold leading-relaxed text-gray-500">
                  {userAddress ? `${userAddress.street}, ${userAddress.city}` : "Please update address"}
                </p>
              </div>
              <Link href="/dashboard/address" className="text-center text-[10px] font-black uppercase text-[#EA638C] bg-white px-5 py-2 rounded-full border border-[#FBB6E6] hover:bg-[#FBB6E6]/20 transition-colors">
                Edit Address
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 mb-4 text-xl font-black text-[#3E442B] uppercase italic">
            <CreditCard className="text-[#EA638C]" /> Payment Plan
          </h2>
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "COD" ? "border-[#EA638C] bg-[#EA638C] text-white shadow-lg shadow-[#FBB6E6]" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm italic font-black tracking-widest uppercase">Partial COD</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "COD" ? "text-[#FBB6E6]" : "text-gray-400"}`}>Pay delivery (+1.5% fee) now</span>
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === "Online" ? "border-[#EA638C] bg-[#EA638C] text-white shadow-lg shadow-[#FBB6E6]" : "border-gray-100 text-gray-400 bg-white"}`}
            >
              <span className="text-sm italic font-black tracking-widest uppercase">Full Pre-payment</span>
              <span className={`text-[10px] font-bold ${paymentMethod === "Online" ? "text-[#FBB6E6]" : "text-gray-400"}`}>Pay full (+1.5% fee) now</span>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-50">
          <h3 className="mb-6 text-sm font-black tracking-widest text-gray-400 uppercase">Order Details ({checkoutItems.length})</h3>
          <div className="space-y-4">
            {checkoutItems.map((item) => (
              <div key={item.uniqueKey || item.id} className="flex items-center gap-4 group">
                <div className="relative">
                   <img src={item.imageUrl} className="object-cover w-16 h-16 transition-transform border-2 border-gray-50 rounded-2xl group-hover:scale-105" alt="" />
                   <span className="absolute -top-2 -right-2 bg-[#3E442B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{item.quantity}x</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {item.color} • {item.size}
                  </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-[#3E442B]">৳{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-32 h-fit">
        <div className="bg-white border-2 border-gray-50 rounded-[3rem] p-8 shadow-2xl shadow-gray-200/50">
          <h2 className="mb-6 text-xl font-black text-[#3E442B] uppercase italic">Summary</h2>
          
          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase">
              <span>Items Total</span>
              <span className="text-[#3E442B]">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase">
              <span className="flex items-center gap-1"><Truck size={14}/> Delivery</span>
              <span className="text-[#3E442B]">৳{shippingCharge}</span>
            </div>

            <div className="flex justify-between text-[11px] font-black text-[#EA638C] uppercase tracking-tighter bg-[#EA638C]/5 p-3 rounded-2xl border border-[#EA638C]/10">
              <span className="flex items-center gap-1.5"><Info size={14}/> Gateway Fee (1.5%)</span>
              <span>৳{mobileBankingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between pt-5 text-lg border-t border-gray-100 border-dashed">
              <span className="font-black text-[#3E442B] uppercase text-xs">Total Bill</span>
              <span className="font-black text-[#3E442B] text-2xl">৳{(finalTotal + mobileBankingFee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className={`rounded-[2rem] p-6 mb-8 border transition-all ${paymentMethod === 'COD' ? 'bg-[#3E442B]' : 'bg-[#EA638C]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em]">Payable Now</span>
              <span className="text-2xl italic font-black text-white">৳{payableNow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">Remaining (COD)</span>
                <span className="font-black text-white/80">৳{dueOnDelivery.toLocaleString()}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-[#EA638C] text-white p-2.5 pr-8 rounded-full font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group disabled:bg-gray-300 shadow-lg shadow-[#FBB6E6] active:scale-95"
          >
            <div className="bg-white p-3.5 rounded-full text-[#EA638C] shadow-sm">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            </div>
            <span className="flex-1 font-black text-center">
              {loading ? "Processing..." : `Complete Order`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}