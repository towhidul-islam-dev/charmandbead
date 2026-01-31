"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/Context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/order";
import { getUserAddress } from "@/actions/userActions";
import toast from "react-hot-toast";
import Link from "next/link";
import BrandButton from "@/components/ui/BrandButton";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  Loader2,
  Phone,
  Truck,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";

const DHAKA_ZONES = [
  "Badda",
  "Banani",
  "Banglamotor",
  "Bashundhara",
  "Cantonment",
  "Dhanmondi",
  "Gulshan",
  "Jatrabari",
  "Khilgaon",
  "Mirpur",
  "Mohakhali",
  "Savar",
  "Mohammadpur",
  "Motijheel",
  "New Market",
  "Old Dhaka",
  "Pallabi",
  "Rampura",
  "Uttara",
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
          const isInsideDhaka = DHAKA_ZONES.some(
            (zone) =>
              city.toLowerCase().includes(zone.toLowerCase()) ||
              city.toLowerCase() === "dhaka",
          );
          setShippingCharge(isInsideDhaka ? 80 : 130);
        }
      }
      setIsInitializing(false);
    }
    initCheckout();
  }, [cart, router, status, session]);

  // Functionality/Logic untouched
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
      toast.error("Please add a shipping address");
      return;
    }
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phone || !bdPhoneRegex.test(phone)) {
      toast.error("Valid BD phone number is required");
      return;
    }

    try {
      setLoading(true);
      const mappedItems = checkoutItems.map((item) => ({
        product: item.productId || item._id,
        name: item.name,
        variant: {
          name: item.color || "Default",
          size: item.size || "N/A",
          variantId: item.variantId || null,
        },
        variantId: item.variantId || null,
        quantity: Number(item.quantity),
        price: Number(item.price),
        imageUrl: item.imageUrl,
        sku: item.sku || "N/A",
      }));

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
        stockProcessed: false,
      };

      const result = await createOrder(orderData);
      if (result.success) {
        const res = await fetch(`/api/payment?orderId=${result.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData: {
              ...orderData,
              id: result.orderId,
              amountPaid: Number(payableNow.toFixed(2)),
            },
          }),
        });
        const payData = await res.json();
        if (payData.url) {
          window.location.replace(payData.url);
          return;
        } else {
          toast.error("Payment gateway failed.");
        }
      } else {
        setStockError(result.message);
        toast.error("Inventory Conflict");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);

      // Send the actual error to your email/dashboard
      if (process.env.NODE_ENV === "production") {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(error);
      }

      toast.error("A system error occurred. We have been notified.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      </div>
    );

  return (
    <div className="relative grid max-w-6xl grid-cols-1 gap-12 px-4 py-10 pt-32 mx-auto lg:grid-cols-3 bg-[#FAFAFA]">
      <div className="space-y-10 lg:col-span-2">
        {/* Destination & Payment Plan sections remain the same */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <MapPin className="text-[#EA638C]" size={28} /> 01. Destination
          </h2>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#EA638C]">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              placeholder="Confirm Delivery Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-16 p-6 rounded-[2rem] border-2 border-gray-100 focus:border-[#EA638C] bg-white outline-none font-bold text-[#3E442B]"
            />
          </div>
          <div className="border-2 border-[#3E442B]/10 p-8 rounded-[2.5rem] bg-white group hover:border-[#3E442B] transition-all">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] mb-1">
                  Registered Address
                </p>
                <p className="text-xl font-bold font-serif text-[#3E442B] truncate">
                  {session?.user?.name}
                </p>
                <p className="mt-1 text-sm italic font-bold leading-relaxed text-gray-400">
                  {userAddress
                    ? `${userAddress.street}, ${userAddress.city}`
                    : "Missing shipping coordinates"}
                </p>
              </div>
              <Link
                href="/dashboard/address"
                className="shrink-0 flex items-center gap-2 text-[10px] font-black uppercase text-[#3E442B] hover:text-[#EA638C] bg-gray-50 px-6 py-3 rounded-full transition-colors"
              >
                Modify <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <CreditCard className="text-[#EA638C]" size={28} /> 02. Payment Plan
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { id: "COD", label: "Partial COD", sub: "Pay Shipping Now" },
              {
                id: "Online",
                label: "Full Pre-pay",
                sub: "100% Secure Payment",
              },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-8 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start transition-all ${paymentMethod === method.id ? "border-[#EA638C] bg-[#3E442B] text-white shadow-xl scale-[1.02]" : "border-gray-100 text-gray-400 bg-white"}`}
              >
                <span
                  className={`text-sm italic font-bold font-serif tracking-widest uppercase ${paymentMethod === method.id ? "text-[#FBB6E6]" : "text-[#3E442B]"}`}
                >
                  {method.label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  {method.sub} (+1.5% fee)
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar with SMALLER TEXT to prevent overflow */}
      <div className="h-auto lg:sticky lg:top-32">
        <div className="bg-[#3E442B] border-t-8 border-[#EA638C] rounded-[3rem] p-6 md:p-8 shadow-2xl w-full overflow-hidden">
          <h2 className="mb-6 font-serif text-xl italic font-bold text-white uppercase">
            Summary
          </h2>

          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span className="shrink-0">Subtotal</span>
              <span className="font-serif text-xs italic text-white">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-2 shrink-0">
                <Truck size={12} className="text-[#FBB6E6]" /> Logistics
              </span>
              <span className="font-serif text-xs italic text-white">
                ৳{shippingCharge}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-[#EA638C] uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5 text-white/60 shrink-0">
                <Info size={12} /> Gateway (1.5%)
              </span>
              <span className="text-[#FBB6E6] font-serif text-[11px] italic">
                ৳
                {mobileBankingFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-5 text-lg border-t border-dashed border-white/10">
              <span className="font-black text-white/30 uppercase text-[8px] tracking-[0.2em] shrink-0">
                Total Bill
              </span>
              <span className="font-serif text-lg italic font-bold text-white md:text-xl">
                ৳
                {(finalTotal + mobileBankingFee).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] p-5 md:p-6 mb-8 bg-white/5 border border-white/10">
            <div className="flex flex-col mb-1">
              <span className="text-[8px] font-black uppercase text-[#FBB6E6] tracking-[0.3em] mb-1">
                Payable Now
              </span>
              <span className="font-serif text-xl italic font-bold text-white truncate md:text-2xl">
                ৳
                {payableNow.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
                <span className="text-[8px] font-black uppercase text-white/20 tracking-widest shrink-0">
                  Due COD
                </span>
                <span className="font-serif text-xs italic font-bold text-white/60">
                  ৳{dueOnDelivery.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-[#EA638C] text-white p-2 pr-6 md:pr-8 rounded-full font-black uppercase tracking-[0.1em] text-[9px] md:text-[10px] transition-all flex items-center justify-between group disabled:bg-white/10 shadow-xl active:scale-95"
          >
            <div className="bg-white p-3 rounded-full text-[#EA638C] shadow-lg shrink-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            </div>
            <span className="flex-1 font-black text-center">
              {loading ? "PROCESSING..." : `FINALIZE ORDER`}
            </span>
          </button>
          {/* <BrandButton
            loading={loading}
            onClick={handlePlaceOrder}
            className="w-full bg-[#EA638C] text-white p-3 rounded-full font-black uppercase tracking-widest text-[11px]"
          >
            {loading ? "Verifying Inventory..." : "Complete Order"}
          </BrandButton> */}

          <p className="mt-6 text-[8px] text-center font-black text-white/20 uppercase tracking-[0.3em]">
            Secure Wholesale Registry Active
          </p>
        </div>
      </div>
    </div>
  );
}
