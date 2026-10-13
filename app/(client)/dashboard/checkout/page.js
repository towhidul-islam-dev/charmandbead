"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/Context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/order";
import { getUserAddress, setDefaultAddress } from "@/actions/userActions";
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
  Upload,
  X,
  Sparkles,
  Smartphone,
  Hash,
  ImageIcon,
  User,
  Scan,
  Maximize2,
  Check,
  Star,
  Plus,
} from "lucide-react";

const INSIDE_DHAKA_THANAS = [
  "Adabor",
  "Azimpur",
  "Badda",
  "Banani",
  "Banglamotor",
  "Baridhara",
  "Bashundhara",
  "Cantonment",
  "Dhanmondi",
  "Farmgate",
  "Gulshan",
  "Hazaribagh",
  "Jatrabari",
  "Kafrul",
  "Kalabagan",
  "Khilgaon",
  "Khilkhet",
  "Kotwali",
  "Lalbagh",
  "Mirpur",
  "Mohakhali",
  "Mohammadpur",
  "Motijheel",
  "New Market",
  "Pallabi",
  "Paltan",
  "Ramna",
  "Rampura",
  "Sabujbagh",
  "Savar",
  "Tejgaon",
  "Uttara",
  "Uttarkhan",
  "Dakshinkhan",
];
const DHAKA_SUBURBAN_THANAS = ["Dhamrai", "Keraniganj", "Nawabganj", "Dohar"];
export default function CheckoutPage() {
  const { cart = [], deleteSelectedItems, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🟢 Multi-Address Management State on Checkout
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingCharge, setShippingCharge] = useState(130);

  // Bangla QR Fields
  const [qrSenderPhone, setQrSenderPhone] = useState("");
  const [qrTxnId, setQrTxnId] = useState("");

  // Payment Screenshot State
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      toast.error("Please login to place an order");
      router.push("/login?callbackUrl=/dashboard/checkout");
      return;
    }

    async function initCheckout() {
      if (showSuccessModal) return;

      const saved = localStorage.getItem("checkoutItems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setCheckoutItems(parsed);
        } else {
          router.push("/cart");
        }
      } else {
        if (cart.length > 0) {
          setCheckoutItems(cart);
        } else if (!showSuccessModal) {
          router.push("/cart");
          function calculateShippingForAddress(addr) {
            if (!addr) return;

            // 1. If saved address already has a deliveryCharge, use it!
            if (addr.deliveryCharge) {
              setShippingCharge(Number(addr.deliveryCharge));
              return;
            }

            const cityText = (addr.city || "").toLowerCase();
            const thanaText = (addr.thana || "").toLowerCase();

            // 2. Check sub-urban outer areas first (Force ৳130)
            const isSuburban = DHAKA_SUBURBAN_THANAS.some(
              (t) =>
                cityText.includes(t.toLowerCase()) ||
                thanaText.includes(t.toLowerCase()),
            );

            if (isSuburban) {
              setShippingCharge(130);
              return;
            }

            // 3. Otherwise check inside Dhaka core / Savar (৳80)
            const isInsideDhaka =
              cityText.includes("dhaka") ||
              INSIDE_DHAKA_THANAS.some(
                (t) =>
                  thanaText === t.toLowerCase() ||
                  cityText.includes(t.toLowerCase()),
              );

            setShippingCharge(isInsideDhaka ? 80 : 130);
          }
        }
      }

      if (session?.user?.email) {
        if (session.user.name) {
          setCustomerName(session.user.name);
        }

        const response = await getUserAddress();
        if (
          response?.success &&
          response.addresses &&
          response.addresses.length > 0
        ) {
          const fetchedAddresses = response.addresses;
          setAddresses(fetchedAddresses);

          const defaultAddr =
            fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0];
          setSelectedAddressId(defaultAddr._id);

          const initialPhone = defaultAddr.phone || "";
          setPhone(initialPhone);
          setQrSenderPhone(initialPhone);

          calculateShippingForAddress(defaultAddr);
        }
      }
      setIsInitializing(false);
    }

    initCheckout(); // 🟢 Ensured proper syntax here
  }, [cart, router, status, session, showSuccessModal]);

  // Helper to compute shipping charge based on selected address
  function calculateShippingForAddress(addr) {
    if (!addr) return;

    // 1. If saved address already has a deliveryCharge, use it!
    if (addr.deliveryCharge) {
      setShippingCharge(Number(addr.deliveryCharge));
      return;
    }

    const cityText = (addr.city || "").toLowerCase();
    const thanaText = (addr.thana || "").toLowerCase();

    // 2. Check sub-urban outer areas first (Force ৳130)
    const isSuburban = DHAKA_SUBURBAN_THANAS.some(
      (t) =>
        cityText.includes(t.toLowerCase()) ||
        thanaText.includes(t.toLowerCase()),
    );

    if (isSuburban) {
      setShippingCharge(130);
      return;
    }

    // 3. Otherwise check inside Dhaka core / Savar (৳80)
    const isInsideDhaka =
      cityText.includes("dhaka") ||
      INSIDE_DHAKA_THANAS.some(
        (t) =>
          thanaText === t.toLowerCase() || cityText.includes(t.toLowerCase()),
      );

    setShippingCharge(isInsideDhaka ? 80 : 130);
  }

  // Handle selecting a specific address card during checkout
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    if (addr.phone) {
      setPhone(addr.phone);
      setQrSenderPhone(addr.phone);
    }
    calculateShippingForAddress(addr);
  };

  // Handle setting primary default address from checkout
  const handleSetPrimary = async (e, id) => {
    e.stopPropagation();
    setSettingDefaultId(id);
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success("Primary address updated!");
      // Update local addresses state flags
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === id })),
      );
    } else {
      toast.error("Failed to update primary address.");
    }
    setSettingDefaultId(null);
  };

  // Active User Address Object for Order Payload
  const activeAddress = useMemo(() => {
    return (
      addresses.find((a) => a._id === selectedAddressId) || addresses[0] || null
    );
  }, [addresses, selectedAddressId]);

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
      { subtotal: 0, totalSavings: 0 },
    );
  }, [checkoutItems]);

  const finalTotal = subtotal + shippingCharge;
  const baseForFee = paymentMethod === "COD" ? shippingCharge : finalTotal;
  const mobileBankingFee = baseForFee * 0.015;
  const payableNow = baseForFee + mobileBankingFee;
  const dueOnDelivery = paymentMethod === "COD" ? subtotal : 0;

  // Image Upload Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      setPaymentScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeScreenshot = () => {
    setPaymentScreenshot(null);
    setPreviewUrl("");
  };

  // Convert File to Base64 String helper
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePlaceOrder = async () => {
    if (status === "unauthenticated") {
      toast.error("Please login to place an order");
      router.push("/login?callbackUrl=/dashboard/checkout");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Customer Name is required");
      return;
    }

    if (!activeAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phone || !bdPhoneRegex.test(phone)) {
      toast.error("Valid BD phone number is required for shipping updates");
      return;
    }

    if (!qrSenderPhone || !bdPhoneRegex.test(qrSenderPhone)) {
      toast.error(
        "Valid sender account/phone number is required for payment confirmation",
      );
      return;
    }
    if (!qrTxnId.trim()) {
      toast.error("Transaction ID (TxnID) is required");
      return;
    }

    if (!paymentScreenshot) {
      toast.error("Payment screenshot is required");
      return;
    }

    setLoading(true);

    try {
      const screenshotBase64 = await convertFileToBase64(paymentScreenshot);
      const userEmail = session?.user?.email || activeAddress?.email || "";

      const orderData = {
        userId: session?.user?.id,
        email: userEmail,
        customerName: customerName.trim(),
        items: checkoutItems.map((item) => {
          let variantName = "N/A";
          if (typeof item.variant === "string") {
            variantName = item.variant;
          } else if (item.variant?.name) {
            variantName = item.variant.name;
          }

          return {
            productId: item.productId || item._id,
            name: item.name || item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || item.thumbnail || "/placeholder.png",
            variant: variantName,
            size: item.size || "N/A",
          };
        }),
        totalAmount: Number((finalTotal + mobileBankingFee).toFixed(2)),
        paidAmount: Number(payableNow.toFixed(2)),
        dueAmount: Number(dueOnDelivery.toFixed(2)),
        deliveryCharge: Number(shippingCharge),
        paymentMethod:
          paymentMethod === "COD"
            ? "Partial_COD_BanglaQR"
            : "Full_PrePay_BanglaQR",
        mobileBankingFee: Number(mobileBankingFee.toFixed(2)),
        phone: phone,
        paymentDetails: {
          sourcePhone: qrSenderPhone,
          transactionId: qrTxnId.trim(),
          screenshot: screenshotBase64,
          gatewayStatus: "MANUAL_VERIFICATION",
        },
        paymentStatus: "Verifying",
        shippingAddress: {
          ...activeAddress,
          phone: phone,
          email: userEmail,
        },
      };

      const response = await createOrder(orderData);

      if (response?.success) {
        setPlacedOrderDetails(response.order || orderData);

        localStorage.removeItem("checkoutItems");

        if (typeof deleteSelectedItems === "function") {
          const boughtIds = checkoutItems.map((i) => i._id || i.productId);
          deleteSelectedItems(boughtIds);
        }

        setShowSuccessModal(true);
        toast.success("Order placed successfully!");
      } else {
        toast.error(response?.message || "Failed to create order.");
      }
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
      toast.error("Failed to initiate order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing || status === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      </div>
    );

  return (
    <div className="relative grid max-w-6xl grid-cols-1 gap-12 px-4 py-10 pt-6 mx-auto lg:grid-cols-3 bg-[#FAFAFA]">
      <div className="space-y-10 lg:col-span-2">
        {/* SECTION 01: DESTINATION & ADDRESS SELECTOR */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <MapPin className="text-[#EA638C]" size={28} /> Destination
          </h2>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#EA638C]">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-16 p-6 rounded-[2rem] border-2 border-gray-100 focus:border-[#EA638C] bg-white outline-none font-bold text-[#3E442B]"
              />
            </div>

            {/* Delivery Phone */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#EA638C]">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="Confirm Delivery Phone *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-16 p-6 rounded-[2rem] border-2 border-gray-100 focus:border-[#EA638C] bg-white outline-none font-bold text-[#3E442B]"
              />
            </div>
          </div>

          {/* Saved Addresses Selector Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em]">
                Select Delivery Address
              </p>
              <Link href="/dashboard/address?callbackUrl=/dashboard/checkout&autoAdd=true">
                Add New Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center bg-white border border-gray-100 rounded-3xl">
                <p className="text-xs font-bold text-gray-400">
                  No saved addresses found.
                </p>
                <Link
                  href="/dashboard/address?callbackUrl=/dashboard/checkout&autoAdd=true"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3E442B] hover:text-[#EA638C] transition-colors"
                >
                  <Plus size={14} /> Add New Address
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;

                  return (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-br from-[#FBB6E6]/10 to-white border-[#EA638C] shadow-md"
                          : "bg-white border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-[#EA638C]">
                            {isSelected ? (
                              <CheckCircle2
                                size={20}
                                fill="#EA638C"
                                className="text-white"
                              />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-0.5 bg-[#3E442B] text-white text-[10px] font-black uppercase rounded-lg">
                                {addr.label || "Home"}
                              </span>

                              {addr.isDefault ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EA638C] text-white text-[10px] font-black uppercase rounded-lg">
                                  <Star size={10} fill="currentColor" /> Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={settingDefaultId === addr._id}
                                  onClick={(e) => handleSetPrimary(e, addr._id)}
                                  className="text-[10px] font-bold text-gray-400 hover:text-[#EA638C] transition-colors"
                                >
                                  {settingDefaultId === addr._id
                                    ? "Saving..."
                                    : "Set as primary"}
                                </button>
                              )}
                            </div>

                            <p className="text-base font-bold font-serif text-[#3E442B]">
                              {addr.fullName ||
                                customerName ||
                                session?.user?.name}
                            </p>
                            <p className="text-xs font-medium leading-relaxed text-gray-500">
                              {addr.street}
                            </p>
                            <p className="text-xs font-semibold text-[#EA638C]">
                              {addr.city} {addr.zipCode && `• ${addr.zipCode}`}
                            </p>
                            <p className="text-xs font-medium text-gray-400">
                              {addr.phone}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-black text-[#3E442B] bg-gray-50 px-3 py-1.5 rounded-xl shrink-0">
                          <Truck size={14} className="text-[#EA638C]" /> ৳
                          {addr.deliveryCharge || 80} DC
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 02: ITEMS REVIEW */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold font-serif text-[#3E442B] uppercase italic">
            <ShoppingBag className="text-[#EA638C]" size={28} /> 02. Purchased
            Items ({checkoutItems.length})
          </h2>
          <div className="space-y-3">
            {checkoutItems.map((item, idx) => {
              const itemImg =
                item.image ||
                item.thumbnail ||
                item.variant?.image ||
                "/placeholder.png";
              const variantTitle =
                typeof item.variant === "string"
                  ? item.variant
                  : item.variant?.name;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={itemImg}
                      alt={item.name || "Product"}
                      className="object-cover border border-gray-100 w-14 h-14 rounded-xl"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#3E442B] truncate max-w-[200px] md:max-w-xs">
                        {item.name || item.productName}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Qty: {item.quantity}{" "}
                        {variantTitle && `Variant: ${variantTitle}`}{" "}
                        {item.size &&
                          item.size !== "N/A" &&
                          `Size: ${item.size}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#3E442B]">
                    ৳
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString()}
                  </span>
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
              {
                id: "COD",
                label: "Partial COD",
                sub: `Pay Shipping Now (৳${shippingCharge}) & Rest on Delivery`,
              },
              {
                id: "Online",
                label: "Full Pre-pay",
                sub: `Pay Entire Invoice Now (৳${finalTotal})`,
              },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-1 items-start text-left transition-all cursor-pointer ${paymentMethod === method.id ? "border-[#EA638C] bg-[#3E442B] text-white shadow-xl scale-[1.02]" : "border-gray-100 text-gray-400 bg-white hover:border-[#EA638C]/50"}`}
              >
                <span
                  className={`text-sm italic font-bold font-serif tracking-widest uppercase ${paymentMethod === method.id ? "text-[#FBB6E6]" : "text-[#3E442B]"}`}
                >
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
        <section className="relative overflow-hidden bg-white border-2 border-[#3E442B] p-5 sm:p-8 rounded-[2.5rem] shadow-sm transition-all space-y-6">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-bold font-serif text-[#3E442B] uppercase italic">
              <QrCode className="text-[#EA638C] shrink-0" size={24} />
              <span>Islami Bank Bangla QR</span>
            </h2>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#EA638C] bg-[#FBB6E6]/30 px-3 py-1 rounded-full border border-[#EA638C]/20">
              Instant Pay
            </span>
          </div>

          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Clickable QR Code Display Area */}
            <div
              onClick={() => setShowQrModal(true)}
              className="lg:col-span-6 bg-gradient-to-b from-[#FBB6E6]/20 via-white to-[#FBB6E6]/10 p-6 sm:p-8 rounded-[2.5rem] border-2 border-[#EA638C]/30 text-center flex flex-col items-center justify-center shadow-md cursor-pointer group hover:border-[#EA638C] transition-all"
            >
              <div className="relative p-4 sm:p-5 bg-white shadow-xl rounded-3xl border border-gray-200 mb-4 w-full max-w-[320px] sm:max-w-[360px] aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src="/charmsqrcode.jpg"
                  alt="Islami Bank Bangla QR"
                  className="object-contain w-full h-full transition-transform duration-300 rounded-2xl group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#3E442B]/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Maximize2 size={18} /> Click to Enlarge
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#3E442B] uppercase tracking-wider bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm group-hover:border-[#EA638C] transition-colors">
                <Scan size={15} className="text-[#EA638C]" />
                <span>Scan to Pay • ৳{payableNow.toFixed(2)}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <Sparkles size={13} className="text-[#EA638C]" />
                <span>bKash • Nagad • CellFin • Any Banking App</span>
              </div>
            </div>

            {/* Form & Instructions Column */}
            <div className="space-y-5 lg:col-span-6">
              <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
                <p className="font-medium leading-relaxed">
                  Scan the QR code to complete your payment of{" "}
                  <strong className="text-[#EA638C] font-bold text-sm">
                    ৳{payableNow.toFixed(2)}
                  </strong>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {" "}
                    (+1.5% gateway charge)
                  </span>
                  .
                </p>
                {paymentMethod === "COD" && (
                  <p className="text-[11px] font-bold text-[#3E442B]/80 pt-1 border-t border-gray-200/60">
                    • Remaining ৳{dueOnDelivery.toLocaleString()} payable as
                    Cash on Delivery.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {/* Sender Account */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-[#3E442B] uppercase tracking-wider mb-1.5">
                    <Smartphone size={13} className="text-[#EA638C]" />
                    <span>
                      Sender Phone / Account Number{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 01XXXXXXXXX"
                    value={qrSenderPhone}
                    onChange={(e) => setQrSenderPhone(e.target.value)}
                    className="w-full p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white outline-none focus:border-[#EA638C] focus:ring-2 focus:ring-[#EA638C]/10 font-semibold text-sm text-[#3E442B] transition-all"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-[#3E442B] uppercase tracking-wider mb-1.5">
                    <Hash size={13} className="text-[#EA638C]" />
                    <span>
                      Transaction ID (TxnID){" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8N76D3W2A"
                    value={qrTxnId}
                    onChange={(e) => setQrTxnId(e.target.value)}
                    className="w-full p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white outline-none focus:border-[#EA638C] focus:ring-2 focus:ring-[#EA638C]/10 font-semibold text-sm text-[#3E442B] transition-all uppercase tracking-wider"
                  />
                </div>

                {/* Payment Screenshot Upload */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-[#3E442B] uppercase tracking-wider mb-1.5">
                    <ImageIcon size={13} className="text-[#EA638C]" />
                    <span>
                      Transaction Screenshot{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {!previewUrl ? (
                    <label className="group flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 hover:border-[#EA638C] rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-[#FBB6E6]/10 transition-all text-center">
                      <div className="p-2.5 rounded-full bg-white shadow-xs text-gray-400 group-hover:text-[#EA638C] group-hover:scale-110 transition-all mb-1.5">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-[#3E442B] tracking-wide">
                        Click or drag image to upload
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                        PNG, JPG or WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative flex items-center gap-3 p-3 bg-white border border-[#EA638C]/30 rounded-2xl shadow-xs">
                      <img
                        src={previewUrl}
                        alt="Payment Screenshot Preview"
                        className="object-cover w-12 h-12 border border-gray-200 sm:w-14 sm:h-14 rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#3E442B] truncate">
                          {paymentScreenshot?.name || "Payment_Proof.jpg"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {(paymentScreenshot?.size / (1024 * 1024)).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="p-2 text-gray-400 transition-colors cursor-pointer hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0"
                        title="Remove Screenshot"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SIDEBAR: SUMMARY */}
      <div className="h-auto lg:sticky lg:top-6">
        <div className="bg-[#3E442B] border-t-8 border-[#EA638C] rounded-[3rem] p-6 md:p-8 shadow-2xl w-full overflow-hidden">
          <h2 className="mb-6 font-serif text-xl italic font-bold text-white uppercase">
            Checkout Summary
          </h2>
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span>Merchandise</span>
              <span className="font-serif text-xs italic text-white">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between items-center gap-2 text-[9px] font-black text-[#FBB6E6] uppercase tracking-widest bg-[#EA638C]/20 p-3 rounded-xl border border-[#EA638C]/30 animate-pulse">
                <span className="flex items-center gap-1.5">
                  <BadgePercent size={12} /> Wholesale Savings
                </span>
                <span className="font-serif text-[11px] italic">
                  - ৳{totalSavings.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Truck size={12} className="text-[#FBB6E6]" /> Logistics
              </span>
              <span className="font-serif text-xs italic text-white">
                ৳{shippingCharge}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5">
                <Info size={12} /> Gateway Fee
              </span>
              <span className="text-white/60 font-serif text-[11px] italic">
                ৳
                {mobileBankingFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-5 text-lg border-t border-dashed border-white/10">
              <span className="font-black text-white/30 uppercase text-[8px] tracking-[0.2em]">
                Final Invoice
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
                Advance Payable
              </span>
              <span className="font-serif text-xl italic font-bold text-white md:text-2xl">
                ৳
                {payableNow.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
                <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">
                  Due at Doorstep
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
            className="w-full bg-[#EA638C] hover:bg-[#ea638c]/90 text-white p-2 pr-6 md:pr-8 rounded-full font-black uppercase tracking-[0.1em] text-[9px] md:text-[10px] transition-all flex items-center justify-between group disabled:bg-white/10 shadow-xl active:scale-95 cursor-pointer"
          >
            <div className="bg-white p-3 rounded-full text-[#EA638C] shadow-lg">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
            </div>
            <span className="flex-1 font-black text-center">
              {loading ? "SUBMITTING..." : "PLACE ORDER"}
            </span>
          </button>
        </div>
      </div>

      {/* QR ZOOM POP-UP MODAL */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 text-center shadow-2xl border-4 border-[#EA638C] relative space-y-3 sm:space-y-4"
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-gray-400 hover:text-[#EA638C] hover:bg-[#FBB6E6]/20 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="pt-1 space-y-1">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3E442B] italic uppercase flex items-center justify-center gap-2">
                <QrCode className="text-[#EA638C]" size={20} />
                <span>Islami Bank Bangla QR</span>
              </h3>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500">
                Scan with bKash, Nagad, CellFin, or any Banking App
              </p>
            </div>

            <div className="relative flex items-center justify-center p-2 bg-white border border-gray-200 aspect-square rounded-2xl">
              <img
                src="/charmsqrcode.jpg"
                alt="Islami Bank Bangla QR Large"
                className="object-contain w-full h-full rounded-xl"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-[#3E442B] text-white font-black text-xs uppercase tracking-wider rounded-2xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
    <div className="bg-white max-w-md w-full rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl border-4 border-[#EA638C] animate-in fade-in zoom-in duration-200">
      <div className="w-20 h-20 mx-auto bg-[#FBB6E6]/30 text-[#EA638C] rounded-full flex items-center justify-center">
        <CheckCircle2 size={42} />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-[#3E442B] italic uppercase">
          Order Confirmed!
        </h3>
        <p className="text-xs leading-relaxed text-gray-500">
          Thank you for your purchase. Your payment verification is in
          progress and your order is being packed.
        </p>
      </div>

      {/* Estimated Delivery Time Range Badge */}
      {(() => {
        const cityText = (activeAddress?.city || "").toLowerCase();
        const thanaText = (activeAddress?.thana || "").toLowerCase();

        const isSuburban = DHAKA_SUBURBAN_THANAS?.some(
          (t) => cityText.includes(t.toLowerCase()) || thanaText.includes(t.toLowerCase())
        );

        const isInsideDhakaOrSavar = 
          !isSuburban && (
            cityText.includes("dhaka") || 
            cityText.includes("savar") ||
            thanaText.includes("savar") ||
            INSIDE_DHAKA_THANAS?.some((t) => thanaText === t.toLowerCase() || cityText.includes(t.toLowerCase()))
          );

        // Inside Dhaka/Savar: 3 to 5 days | Outer Districts & Suburban: 4 to 6 days
        const minDays = isInsideDhakaOrSavar ? 3 : 4;
        const maxDays = isInsideDhakaOrSavar ? 5 : 6;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + minDays);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + maxDays);

        const formattedStart = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const formattedEnd = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return (
          <div className="p-4 rounded-2xl bg-[#FBB6E6]/20 border border-[#FBB6E6] text-[#3E442B] text-xs flex flex-col items-center justify-center gap-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#EA638C]">Estimated Delivery</span>
            <span className="font-semibold">
              Expected between <strong>{formattedStart}</strong> and <strong>{formattedEnd}</strong> ({minDays}–{maxDays} days)
            </span>
          </div>
        );
      })()}

      <button
        onClick={() => router.push("/dashboard/orders")}
        className="w-full py-4 bg-[#3E442B] hover:bg-[#EA638C] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>View My Orders</span> <ArrowRight size={16} />
      </button>
    </div>
  </div>
)}
    </div>
  );
}
