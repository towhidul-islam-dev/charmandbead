"use client";

import { useState, useEffect, useMemo } from "react";
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
  Info,
  ChevronRight,
  BadgePercent,
  QrCode,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Clock,
} from "lucide-react";

const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment",
  "Dhanmondi", "Gulshan", "Jatrabari", "Khilgaon", "Mirpur",
  "Mohakhali", "Savar", "Mohammadpur", "Motijheel", "New Market",
  "Old Dhaka", "Pallabi", "Rampura", "Uttara",
];

export default function CheckoutPage() {
  const { cart = [], deleteSelectedItems, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userAddress, setUserAddress] = useState(null);
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingCharge, setShippingCharge] = useState(130);

  // Bangla QR Fields
  const [qrSenderPhone, setQrSenderPhone] = useState("");
  const [qrTxnId, setQrTxnId] = useState("");

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  useEffect(() => {
    async function initCheckout() {
      const saved = localStorage.getItem("checkoutItems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setCheckoutItems(parsed);
        } else if (!showSuccessModal) {
          router.push("/cart");
        }
      } else {
        if (cart.length > 0) {
          setCheckoutItems(cart);
        } else if (status !== "loading" && !showSuccessModal) {
          router.push("/cart");
        }
      }

      if (session?.user?.email) {
        const response = await getUserAddress();
        if (response?.success && response.address) {
          setUserAddress(response.address);
          const initialPhone = response.address.phone || "";
          setPhone(initialPhone);
          setQrSenderPhone(initialPhone);

          const city = response.address.city || "";
          const isInsideDhaka = DHAKA_ZONES.some(
            (zone) =>
              city.toLowerCase().includes(zone.toLowerCase()) ||
              city.toLowerCase() === "dhaka"
          );
          setShippingCharge(isInsideDhaka ? 80 : 130);
        }
      }
      setIsInitializing(false);
    }
    initCheckout();
  }, [cart, router, status, session, showSuccessModal]);

  // Dynamic Calculations
  const { subtotal, totalSavings } = useMemo(() => {
    return checkoutItems.reduce(
      (acc, item) => {
        const itemPrice = Math.max(0, Number(item.price) || 0);
        const basePrice = Math.max(0, Number(item.basePrice) || itemPrice);
        const qty = Math.max(1, Number(item.quantity) || 1);

        acc.subtotal += itemPrice * qty;
        acc.totalSavings += Math.max(0, basePrice - itemPrice) * qty;
        return acc;
      },
      { subtotal: 0, totalSavings: 0 }
    );
  }, [checkoutItems]);

  const finalTotal = subtotal + shippingCharge;
  const baseForFee = paymentMethod === "COD" ? shippingCharge : finalTotal;
  const mobileBankingFee = baseForFee * 0.015;
  const payableNow = baseForFee + mobileBankingFee;
  const dueOnDelivery = paymentMethod === "COD" ? subtotal : 0;

  const handlePlaceOrder = async () => {
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
      toast.error("Valid BD phone number is required for shipping updates");
      return;
    }

    if (!qrSenderPhone || !bdPhoneRegex.test(qrSenderPhone)) {
      toast.error("Valid sender account/phone number is required for payment confirmation");
      return;
    }
    if (!qrTxnId.trim()) {
      toast.error("Transaction ID (TxnID) is required");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: session?.user?.id,
        items: checkoutItems.map((item) => {
          const variantName = typeof item.variant === "string"
            ? item.variant
            : (item.variant?.name || item.color || "Default");

          let variantImg =
            item.variant?.image ||
            item.variant?.img ||
            item.variant?.thumbnail ||
            item.variantImage ||
            item.selectedVariant?.image;

          if (!variantImg) {
            const imagesArr = item.images || item.product?.images || item.productImages;
            if (Array.isArray(imagesArr) && imagesArr.length > 0) {
              let idx = -1;
              if (typeof item.variantIndex === "number") idx = item.variantIndex;
              else if (typeof item.variant === "number") idx = item.variant;
              else if (typeof variantName === "string") {
                const parsed = parseInt(variantName, 10);
                if (!isNaN(parsed)) idx = parsed - 1;
              }

              if (idx >= 0 && idx < imagesArr.length) {
                variantImg = imagesArr[idx];
              } else {
                variantImg = imagesArr[0];
              }
            }
          }

          if (!variantImg) {
            variantImg = item.image || item.thumbnail || item.product?.imageUrl || null;
          }

          return {
            productId: item.productId || item._id,
            productName: item.name || item.productName || "Product",
            variant: {
              name: variantName,
              size: item.size || "N/A",
              variantId: item.variantId || item.variant?._id || null,
              image: variantImg,
            },
            quantity: Number(item.quantity),
            price: Number(item.price),
            sku: item.sku || "C&B-GEN",
          };
        }),
        totalAmount: Number((finalTotal + mobileBankingFee).toFixed(2)),
        paidAmount: Number(payableNow.toFixed(2)),
        dueAmount: Number(dueOnDelivery.toFixed(2)),
        deliveryCharge: Number(shippingCharge),
        paymentMethod: paymentMethod === "COD" ? "Partial_COD_BanglaQR" : "Full_PrePay_BanglaQR",
        mobileBankingFee: Number(mobileBankingFee.toFixed(2)),
        phone: phone,
        paymentDetails: {
          sourcePhone: qrSenderPhone,
          transactionId: qrTxnId.trim(),
          gatewayStatus: "MANUAL_VERIFICATION",
        },
        paymentStatus: "Verifying",
        shippingAddress: userAddress,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        try {
          const keysToRemove = checkoutItems
            .map((item) => item.uniqueKey || item.productId || item._id)
            .filter(Boolean);

          if (keysToRemove.length > 0 && typeof deleteSelectedItems === "function") {
            deleteSelectedItems(keysToRemove);
          } else if (typeof clearCart === "function") {
            clearCart();
          }
        } catch (err) {
          console.error("CART_CLEANUP_ERROR:", err);
        }

        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("purchasedKeys");

        setPlacedOrderDetails({
          id: result.orderId || result.data?._id || "NEW",
          amountPaid: payableNow,
          due: dueOnDelivery,
          txnId: qrTxnId.trim(),
        });
        setShowSuccessModal(true);
      } else {
        toast.error(result.message || "Order creation failed.");
      }
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
      toast.error("Failed to initiate order.");
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
    <div className="relative grid max-w-6xl grid-cols-1 gap-12 px-4 py-10 pt-6 mx-auto lg:grid-cols-3 bg-[#FAFAFA]">
      <div className="space-y-10 lg:col-span-2">
        {/* SECTION 01: DESTINATION */}
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
                <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] mb-1">Registered Address</p>
                <p className="text-xl font-bold font-serif text-[#3E442B] truncate">{session?.user?.name}</p>
                <p className="mt-1 text-sm italic font-bold leading-relaxed text-gray-400">
                  {userAddress ? `${userAddress.street}, ${userAddress.city}` : "Missing shipping coordinates"}
                </p>
              </div>
              <Link href="/dashboard/address" className="shrink-0 flex items-center gap-2 text-[10px] font-black uppercase text-[#3E442B] hover:text-[#EA638C] bg-gray-50 px-6 py-3 rounded-full transition-colors">
                Modify <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 02: ITEMS REVIEW */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <ShoppingBag className="text-[#EA638C]" size={28} /> 02. Purchased Items ({checkoutItems.length})
          </h2>
          <div className="space-y-3">
            {checkoutItems.map((item, idx) => {
              const itemImg = item.image || item.thumbnail || item.variant?.image || "/placeholder.png";
              const variantTitle = typeof item.variant === "string" ? item.variant : item.variant?.name;
              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img src={itemImg} alt={item.name || "Product"} className="object-cover border border-gray-100 w-14 h-14 rounded-xl" />
                    <div>
                      <h4 className="text-sm font-bold text-[#3E442B] truncate max-w-[200px] md:max-w-xs">{item.name || item.productName}</h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Qty: {item.quantity} {variantTitle && `• Variant: ${variantTitle}`} {item.size && item.size !== "N/A" && `• Size: ${item.size}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#3E442B]">৳{(Number(item.price) * Number(item.quantity)).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 03: PAYMENT PLAN */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <CreditCard className="text-[#EA638C]" size={28} /> 03. Payment Plan
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { id: "COD", label: "Partial COD", sub: `Pay Shipping Now (৳${shippingCharge}) & Rest on Delivery` },
              { id: "Online", label: "Full Pre-pay", sub: `Pay Entire Invoice Now (৳${finalTotal})` },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start text-left transition-all cursor-pointer ${paymentMethod === method.id ? "border-[#EA638C] bg-[#3E442B] text-white shadow-xl scale-[1.02]" : "border-gray-100 text-gray-400 bg-white hover:border-[#EA638C]/50"}`}
              >
                <span className={`text-sm italic font-bold font-serif tracking-widest uppercase ${paymentMethod === method.id ? "text-[#FBB6E6]" : "text-[#3E442B]"}`}>
                  {method.label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  {method.sub}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 04: BANGLA QR VERIFICATION */}
        <section className="space-y-6 border-2 border-[#3E442B] p-8 rounded-[2.5rem] bg-white transition-all">
          <h2 className="flex items-center gap-3 text-xl font-bold font-serif text-[#3E442B] uppercase italic">
            <QrCode className="text-[#EA638C]" size={24} /> Islami Bank Bangla QR Payment
          </h2>
          
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="bg-[#FBB6E6] p-4 rounded-[2rem] text-center w-full md:w-auto shrink-0">
              <div className="inline-block p-2 bg-white shadow-sm rounded-2xl">
                <img 
                  src="/ibbl-bangla-qr.jpg" 
                  alt="Islami Bank Bangla QR" 
                  className="object-contain mx-auto w-52 h-52"
                />
              </div>
              <p className="text-[10px] font-black uppercase text-[#3E442B] tracking-wider mt-2">
                Scan via bKash, Nagad, or CellFin
              </p>
            </div>

            <div className="w-full space-y-4">
              <p className="text-xs italic font-medium text-gray-500">
                Please scan the QR code above with your app to complete your payment of{" "}
                <strong className="text-[#EA638C] text-sm font-bold">৳{payableNow.toFixed(2)}</strong> (Includes +1.5% gateway processing fees).
                {paymentMethod === "COD" && (
                  <span className="block mt-1 font-bold text-gray-400">
                    * The remaining merchandise balance of ৳{dueOnDelivery.toLocaleString()} will be handled as Cash on Delivery.
                  </span>
                )}
              </p>
              
              <div>
                <label className="block text-[10px] font-black text-[#3E442B] uppercase tracking-wider mb-1">
                  Sender Account / Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 01XXXXXXXXX"
                  value={qrSenderPhone}
                  onChange={(e) => setQrSenderPhone(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#EA638C] font-semibold text-sm text-[#3E442B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#3E442B] uppercase tracking-wider mb-1">
                  Transaction ID (TxnID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8N76D3W2A"
                  value={qrTxnId}
                  onChange={(e) => setQrTxnId(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#EA638C] font-semibold text-sm text-[#3E442B]"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SIDEBAR: SUMMARY */}
      <div className="h-auto lg:sticky lg:top-6">
        <div className="bg-[#3E442B] border-t-8 border-[#EA638C] rounded-[3rem] p-6 md:p-8 shadow-2xl w-full overflow-hidden">
          <h2 className="mb-6 font-serif text-xl italic font-bold text-white uppercase">Checkout Summary</h2>
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span>Merchandise</span>
              <span className="font-serif text-xs italic text-white">৳{subtotal.toLocaleString()}</span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between items-center gap-2 text-[9px] font-black text-[#FBB6E6] uppercase tracking-widest bg-[#EA638C]/20 p-3 rounded-xl border border-[#EA638C]/30 animate-pulse">
                <span className="flex items-center gap-1.5"><BadgePercent size={12} /> Wholesale Savings</span>
                <span className="font-serif text-[11px] italic">- ৳{totalSavings.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Truck size={12} className="text-[#FBB6E6]" /> Logistics</span>
              <span className="font-serif text-xs italic text-white">৳{shippingCharge}</span>
            </div>
            
            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5"><Info size={12} /> Gateway Fee</span>
              <span className="text-white/60 font-serif text-[11px] italic">৳{mobileBankingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-5 text-lg border-t border-dashed border-white/10">
              <span className="font-black text-white/30 uppercase text-[8px] tracking-[0.2em]">Final Invoice</span>
              <span className="font-serif text-lg italic font-bold text-white md:text-xl">
                ৳{(finalTotal + mobileBankingFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] p-5 md:p-6 mb-8 bg-white/5 border border-white/10">
            <div className="flex flex-col mb-1">
              <span className="text-[8px] font-black uppercase text-[#FBB6E6] tracking-[0.3em] mb-1">Advance Payable</span>
              <span className="font-serif text-xl italic font-bold text-white md:text-2xl">
                ৳{payableNow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
                <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Due at Doorstep</span>
                <span className="font-serif text-xs italic font-bold text-white/60">৳{dueOnDelivery.toLocaleString()}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || checkoutItems.length === 0}
            className="w-full bg-[#EA638C] hover:bg-[#ea638c]/90 text-white p-2 pr-6 md:pr-8 rounded-full font-black uppercase tracking-[0.1em] text-[9px] md:text-[10px] transition-all flex items-center justify-between group disabled:bg-white/10 shadow-xl active:scale-95 cursor-pointer"
          >
            <div className="bg-white p-3 rounded-full text-[#EA638C] shadow-lg">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            </div>
            <span className="flex-1 font-black text-center">
              {loading ? "SUBMITTING..." : "PLACE ORDER"}
            </span>
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION POP-UP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-[#FBB6E6] relative space-y-6">
            <div className="w-20 h-20 bg-[#FBB6E6] text-[#EA638C] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-[#3E442B] italic uppercase">
                Order Placed Successfully!
              </h3>
              <p className="max-w-sm mx-auto text-xs font-medium leading-relaxed text-gray-600">
                Thank you for your order! We have received your payment details. An admin will verify your payment and confirm your order shortly.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-100 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tracking-wider text-gray-400 uppercase">Txn ID</span>
                <span className="font-bold text-[#3E442B] font-mono">{placedOrderDetails?.txnId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tracking-wider text-gray-400 uppercase">Amount Advance Paid</span>
                <span className="font-bold text-[#EA638C] font-serif">৳{placedOrderDetails?.amountPaid?.toFixed(2)}</span>
              </div>
              {placedOrderDetails?.due > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold tracking-wider text-gray-400 uppercase">Due on Delivery</span>
                  <span className="font-bold text-[#3E442B] font-serif">৳{placedOrderDetails?.due?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-100">
                <span className="flex items-center gap-1 font-bold tracking-wider text-gray-400 uppercase">
                  <Clock size={12} className="text-[#EA638C]" /> Status
                </span>
                <span className="px-3 py-1 bg-[#FBB6E6]/40 text-[#EA638C] rounded-full font-black text-[10px] uppercase">
                  Awaiting Admin Verification
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/orders")}
              className="w-full bg-[#3E442B] hover:bg-[#EA638C] text-white py-4 px-6 rounded-full font-black uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              View Order Status <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}