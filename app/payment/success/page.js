"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getOrderById } from "@/actions/order";
import { processOrderStock } from "@/actions/inventoryWatcher";
import { sendInvoiceEmail } from "@/actions/emailActions";
import { useCart } from "@/Context/CartContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle,
  Download,
  Wallet,
  Banknote,
  Loader2,
  Truck,
  AlertCircle,
  CreditCard,
  MailCheck,
} from "lucide-react";
// 🟢 FIXED: Lowercase 'jspdf' to match the npm package name
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const cacheBustedUrl = url.includes("?")
      ? `${url}&t=${Date.now()}`
      : `${url}?t=${Date.now()}`;

    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => {
      console.error("Could not load image at:", url);
      reject(error);
    };
    img.src = cacheBustedUrl;
  });
};

function SuccessContent() {
  const { deleteSelectedItems } = useCart();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    const recipientEmail = order.email || session?.user?.email;
    if (!recipientEmail) {
      toast.error("No email address found for this order.");
      return;
    }

    setIsResending(true);
    try {
      await sendInvoiceEmail({
        orderId: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        name:
          order.shippingAddress?.name ||
          session?.user?.name ||
          "Valued Customer",
        email: recipientEmail,
        shippingAddress: order.shippingAddress,
      });
      toast.success("Invoice resent successfully!", { icon: "📧" });
    } catch (error) {
      toast.error("Failed to resend email.");
    } finally {
      setIsResending(false);
    }
  };
  useEffect(() => {
    async function fetchAndProcessOrder() {
      // 1. Exit if no ID or if we've already finished processing this mount
      if (!orderId || isProcessed) return;

      try {
        const data = await getOrderById(orderId);

        if (data) {
          setOrder(data);

          // 2. Process Inventory Stock
          if (!data.stockProcessed) {
            await processOrderStock(data);
          }

          // 3. Clear Cart Items
          const saved = localStorage.getItem("checkoutItems");
          if (saved) {
            const purchasedItems = JSON.parse(saved);
            const keysToRemove = purchasedItems.map((item) => item.uniqueKey);
            deleteSelectedItems(keysToRemove);
            localStorage.removeItem("checkoutItems");
          }

          // 4. 🟢 Targeted Email Logic
          // Check for email in order data first, then session
          const recipientEmail =
            data.email || data.shippingAddress?.email || session?.user?.email;

          if (!emailSent && recipientEmail) {
            try {
              await sendInvoiceEmail({
                orderId: data._id,
                items: data.items,
                totalAmount: data.totalAmount,
                name:
                  data.shippingAddress?.name ||
                  session?.user?.name ||
                  "Valued Customer",
                email: recipientEmail,
                shippingAddress: data.shippingAddress,
              });
              setEmailSent(true);
              toast.success("Invoice sent to your email!", { icon: "📧" });
            } catch (emailErr) {
              console.error("Email delivery failed:", emailErr);
            }
          } else if (!emailSent && !recipientEmail) {
            // Log this only if loading is actually finished and we still have nothing
            console.warn("Waiting for recipient email details...");
          }

          setIsProcessed(true);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAndProcessOrder();
  }, [orderId, isProcessed, deleteSelectedItems, session, emailSent]);

  const generateInvoice = async (orderData) => {
    if (!orderData || !orderData.items) return;

    setIsGenerating(true);
    const toastId = toast.loading("Preparing high-res invoice...");

    try {
      const doc = new jsPDF();
      const brandColor = [234, 99, 140];
      const darkGreen = [62, 68, 43];
      const darkColor = [31, 41, 55];
      const lightGray = [156, 163, 175];

      const images = await Promise.all(
        orderData.items.map(async (item) => {
          try {
            const imgUrl = item.imageUrl || item.image || item.variant?.image;
            return imgUrl ? await getBase64ImageFromURL(imgUrl) : null;
          } catch (e) {
            return null;
          }
        }),
      );

      doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("CHARM STORE", 14, 25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("PREMIUM WHOLESALE REGISTRY", 14, 32);

      const isPaid = (orderData.dueAmount ?? 0) <= 0;
      doc.setDrawColor(255, 255, 255);
      doc.roundedRect(150, 15, 45, 12, 2, 2, "D");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(isPaid ? "FULLY PAID" : "PARTIAL COD", 172.5, 23, {
        align: "center",
      });

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(12);
      doc.text("INVOICE DETAILS", 14, 55);
      doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.line(14, 57, 30, 57);

      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("INVOICE NO:", 14, 65);
      doc.text("DATE:", 14, 70);
      doc.text("BILL TO:", 120, 65);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`#INV-${orderData._id.slice(-6).toUpperCase()}`, 40, 65);
      doc.text(
        new Date(orderData.createdAt).toLocaleDateString("en-GB"),
        40,
        70,
      );
      doc.text(orderData.shippingAddress?.name || "Customer", 120, 70);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(
        `${orderData.shippingAddress?.street || ""}, ${orderData.shippingAddress?.city || ""}`,
        120,
        75,
        { maxWidth: 70 },
      );

      const tableRows = orderData.items.map((item) => [
        "",
        {
          content: `${item.productName || item.name || "Premium Selection"}\n${item.variant?.name || item.color || ""} ${item.variant?.size || item.size || ""}`,
          styles: { fontStyle: "bold", fontSize: 10 },
        },
        item.quantity,
        `TK ${item.price.toLocaleString()}`,
        `TK ${(item.price * item.quantity).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["IMG", "PRODUCT DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
          fillColor: [249, 250, 251],
          textColor: brandColor,
          fontStyle: "bold",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          2: { halign: "center" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
        styles: { minCellHeight: 25, valign: "middle" },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const base64Img = images[data.row.index];
            if (base64Img) {
              doc.addImage(
                base64Img,
                "PNG",
                data.cell.x + 2.5,
                data.cell.y + 2.5,
                20,
                20,
              );
            }
          }
        },
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      const summaryX = 140;
      const valueX = 195;

      const drawRow = (l, v, y, b = false, c = darkColor) => {
        doc.setFont("helvetica", b ? "bold" : "normal");
        doc.setTextColor(c[0], c[1], c[2]);
        doc.text(l, summaryX, y);
        doc.text(v, valueX, y, { align: "right" });
      };

      const subtotal = orderData.items.reduce(
        (a, i) => a + i.price * i.quantity,
        0,
      );
      drawRow("Subtotal", `TK ${subtotal.toLocaleString()}`, finalY);
      drawRow(
        "Shipping",
        `+ TK ${(orderData.deliveryCharge || 0).toLocaleString()}`,
        finalY + 7,
      );

      if (orderData.mobileBankingFee > 0) {
        drawRow(
          "Gateway Fee (1.5%)",
          `+ TK ${orderData.mobileBankingFee.toLocaleString()}`,
          finalY + 14,
          false,
          brandColor,
        );
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(summaryX, finalY + 17, valueX, finalY + 17);
      drawRow(
        "Grand Total",
        `TK ${(orderData?.totalAmount ?? 0).toLocaleString()}`,
        finalY + 24,
        true,
      );
      drawRow(
        "Paid Online",
        `- TK ${(orderData?.paidAmount ?? 0).toLocaleString()}`,
        finalY + 31,
        false,
        brandColor,
      );

      if (orderData.dueAmount > 0) {
        doc.setFillColor(254, 242, 242);
        doc.rect(summaryX - 5, finalY + 35, 60, 10, "F");
        drawRow(
          "Balance Due (COD)",
          `TK ${(orderData?.dueAmount ?? 0).toLocaleString()}`,
          finalY + 41,
          true,
          [220, 38, 38],
        );
      }

      doc.setFontSize(8);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(
        "Official Invoice Generated via Charm Store Registry.",
        105,
        285,
        { align: "center" },
      );

      doc.save(
        `Invoice_CharmStore_${orderData._id.slice(-6).toUpperCase()}.pdf`,
      );
      toast.success("Invoice Downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin text-[#EA638C] mx-auto mb-4"
            size={48}
          />
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase animate-pulse">
            Confirming Registry...
          </p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="p-10 font-black tracking-widest text-center text-gray-400 uppercase">
        ORDER NOT FOUND
      </div>
    );

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const isPartial = (order.dueAmount ?? 0) > 0;

  return (
    <div className="max-w-2xl px-6 py-20 mx-auto">
      <div className="bg-white border-2 border-gray-50 p-8 shadow-2xl rounded-[3rem] text-center overflow-hidden">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-green-50">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="mb-2 text-3xl italic font-black tracking-tighter text-[#3E442B] uppercase">
          Registry Success
        </h1>
        <p className="mb-4 font-bold text-gray-400">
          Order #INV-{order._id.slice(-6).toUpperCase()}
        </p>

        {/* <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 border border-gray-100 rounded-full bg-gray-50">
          <MailCheck size={14} className="text-[#EA638C]" />
          <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
            Invoiced to {order.email || session?.user?.email}
          </span>
        </div> */}

        {/* 🟢 Email Confirmation Badge & Resend Button */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-gray-100 rounded-full bg-gray-50">
            <MailCheck size={14} className="text-[#EA638C]" />
            <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
              Invoiced to {order.email || session?.user?.email}
            </span>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="text-[9px] font-bold uppercase tracking-widest text-[#EA638C] hover:text-[#3E442B] transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                Not in inbox?{" "}
                <span className="underline decoration-2 underline-offset-4">
                  Resend Invoice
                </span>
              </>
            )}
          </button>
        </div>

        {isPartial && (
          <div className="mb-8 p-6 bg-pink-50 border-2 border-[#FBB6E6] rounded-[2rem] flex items-center gap-4 text-left">
            <div className="p-2 text-white bg-[#EA638C] rounded-full shadow-lg shadow-pink-200">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#EA638C] tracking-widest leading-none mb-1">
                COD Notice
              </p>
              <p className="text-sm font-bold text-gray-800">
                Rider will collect ৳{order.dueAmount.toLocaleString()} upon
                delivery.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => generateInvoice(order)}
          disabled={isGenerating}
          className="mb-8 flex items-center gap-3 mx-auto text-[10px] font-black uppercase tracking-widest text-[#EA638C] bg-white border-2 border-pink-100 px-10 py-5 rounded-full hover:bg-[#EA638C] hover:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download Detailed Invoice
        </button>

        <div className="bg-gray-50 rounded-[2.5rem] p-8 text-left space-y-4 mb-10 border border-gray-100">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase mb-2">
            Cost Breakdown
          </h3>

          <div className="pb-4 space-y-3 border-b border-gray-200 border-dashed">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span>Items Total:</span>
              <span className="text-[#3E442B]">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span className="flex items-center gap-2">
                <Truck size={14} className="text-[#EA638C]" /> Logistics:
              </span>
              <span className="text-[#3E442B]">
                ৳{(order.deliveryCharge ?? 0).toLocaleString()}
              </span>
            </div>

            {order.mobileBankingFee > 0 && (
              <div className="flex justify-between text-xs font-black text-[#EA638C] uppercase">
                <span className="flex items-center gap-2">
                  <CreditCard size={14} /> Gateway Fee (1.5%):
                </span>
                <span>৳{order.mobileBankingFee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 text-lg font-black text-[#3E442B] uppercase italic">
              <span>Total Bill:</span>
              <span>৳{(order.totalAmount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between text-xs font-black text-green-600 uppercase">
              <span className="flex items-center gap-2">
                <Wallet size={14} /> Paid Online:
              </span>
              <span>- ৳{(order.paidAmount ?? 0).toLocaleString()}</span>
            </div>

            <div
              className={`flex justify-between p-5 rounded-2xl transition-all ${isPartial ? "bg-[#3E442B] text-white shadow-xl" : "bg-gray-100 text-gray-400"}`}
            >
              <div className="flex items-center gap-2">
                <Banknote
                  size={18}
                  className={isPartial ? "text-[#FBB6E6]" : ""}
                />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isPartial ? "Residual COD:" : "Balance Due:"}
                </span>
              </div>
              <span className="text-lg font-black">
                ৳{(order.dueAmount ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/orders"
            className="py-5 text-center text-[10px] font-black tracking-widest text-white uppercase bg-[#3E442B] rounded-2xl hover:bg-black shadow-lg shadow-[#3E442B]/10 transition-all"
          >
            Track Orders
          </Link>
          <Link
            href="/"
            className="py-5 text-center text-[10px] font-black tracking-widest text-gray-600 uppercase bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
          >
            Shop More
          </Link>
        </div>
      </div>
      <p className="text-center mt-10 text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">
        Secure Wholesale Registry • Verified Transaction
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <Loader2 className="animate-spin text-[#EA638C]" size={40} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
