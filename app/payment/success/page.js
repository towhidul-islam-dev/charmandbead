"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getOrderById } from "@/actions/order";
import { processOrderStock } from "@/actions/inventoryWatcher";
import { useCart } from "@/Context/CartContext";
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
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

// Helper for PDF images
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

function SuccessContent() {
  const { deleteSelectedItems } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchAndProcessOrder() {
      if (orderId) {
        try {
          const data = await getOrderById(orderId);
          setOrder(data);

          if (data && !data.stockProcessed) {
            await processOrderStock(data);
          }

          const saved = localStorage.getItem("checkoutItems");
          if (saved) {
            const purchasedItems = JSON.parse(saved);
            const keysToRemove = purchasedItems.map((item) => item.uniqueKey);
            deleteSelectedItems(keysToRemove);
            localStorage.removeItem("checkoutItems");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        }
      }
      setLoading(false);
    }
    fetchAndProcessOrder();
  }, [orderId, deleteSelectedItems]);

  const generateInvoice = async (orderData) => {
    if (!orderData || !orderData.items) return;

    setIsGenerating(true);
    const toastId = toast.loading("Styling your premium invoice...");

    try {
      const doc = new jsPDF();
      const brandColor = [234, 99, 140]; // #EA638C
      const darkGreen = [62, 68, 43];   // #3E442B
      const darkColor = [31, 41, 55]; 
      const lightGray = [156, 163, 175];

      const itemsSubtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const delivery = orderData.deliveryCharge || 0;
      const mbFee = orderData.mobileBankingFee || 0; // 🟢 Fee from DB

      const images = await Promise.all(
        orderData.items.map(async (item) => {
          try {
            const imgUrl = item.variant?.image || item.image || item.imageUrl;
            return imgUrl ? await getBase64ImageFromURL(imgUrl) : null;
          } catch (e) { return null; }
        })
      );

      doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.rect(0, 0, 210, 40, "F"); 

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24); doc.setFont("helvetica", "bold");
      doc.text("CHARM STORE", 14, 25);
      
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text("PREMIUM WHOLESALE COMMERCE", 14, 32);

      const isPaid = (orderData.dueAmount ?? 0) <= 0;
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.roundedRect(150, 15, 45, 12, 2, 2, "D");
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text(isPaid ? "FULLY PAID" : "PARTIAL COD", 172.5, 23, { align: "center" });

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(12); doc.text("INVOICE DETAILS", 14, 55);
      doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.setLineWidth(1); doc.line(14, 57, 30, 57);

      doc.setFontSize(9); doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("INVOICE NO:", 14, 65); doc.text("DATE:", 14, 70); doc.text("BILL TO:", 120, 65);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`#INV-${orderData._id.slice(-6).toUpperCase()}`, 40, 65);
      doc.text(new Date(orderData.createdAt).toLocaleDateString('en-GB'), 40, 70);
      doc.text(orderData.shippingAddress?.name || "Customer", 120, 70);
      
      doc.setFont("helvetica", "normal"); doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`${orderData.shippingAddress?.street || ""}, ${orderData.shippingAddress?.city || ""}`, 120, 75, { maxWidth: 70 });

      const tableRows = orderData.items.map((item) => [
        "", 
        { content: `${item.name}\n${item.color || ""} ${item.size || ""}`, styles: { fontStyle: 'bold', fontSize: 10 } },
        item.quantity,
        `TK ${item.price.toLocaleString()}`,
        `TK ${(item.price * item.quantity).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["", "PRODUCT DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
        body: tableRows,
        theme: 'plain',
        headStyles: { fillColor: [249, 250, 251], textColor: brandColor, fontStyle: 'bold', fontSize: 9 },
        columnStyles: { 0: { cellWidth: 25 }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        styles: { minCellHeight: 25, valign: "middle" },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const base64Img = images[data.row.index];
            if (base64Img) doc.addImage(base64Img, "PNG", data.cell.x + 2, data.cell.y + 2, 20, 20);
          }
        },
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      const summaryX = 140;
      const valueX = 195;

      const drawSummaryRow = (label, value, y, isBold = false, color = darkColor) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(label, summaryX, y);
        doc.text(value, valueX, y, { align: "right" });
      };

      drawSummaryRow("Subtotal", `TK ${itemsSubtotal.toLocaleString()}`, finalY);
      drawSummaryRow("Shipping", `+ TK ${delivery.toLocaleString()}`, finalY + 7);
      
      // 🟢 Added Mobile Banking Fee to Summary
      if (mbFee > 0) {
        drawSummaryRow("Gateway Fee (1.5%)", `+ TK ${mbFee.toLocaleString()}`, finalY + 14, false, brandColor);
      }

      doc.line(summaryX, finalY + 17, valueX, finalY + 17);
      drawSummaryRow("Grand Total", `TK ${(orderData?.totalAmount ?? 0).toLocaleString()}`, finalY + 24, true);
      drawSummaryRow("Paid Online", `- TK ${(orderData?.paidAmount ?? 0).toLocaleString()}`, finalY + 31, false, brandColor);
      
      if (orderData.dueAmount > 0) {
          doc.setFillColor(254, 242, 242);
          doc.rect(summaryX - 5, finalY + 35, 60, 10, "F");
          drawSummaryRow("Balance Due (COD)", `TK ${(orderData?.dueAmount ?? 0).toLocaleString()}`, finalY + 41, true, [220, 38, 38]);
      }

      doc.setFontSize(8); doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("Thank you for shopping with Charm Store.", 105, 285, { align: "center" });

      doc.save(`Invoice_${orderData._id.slice(-6).toUpperCase()}.pdf`);
      toast.success("Invoice Downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#EA638C] mx-auto mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-gray-400 text-xs">Confirming Order...</p>
      </div>
    </div>
  );
  
  if (!order) return <div className="p-10 font-black text-center text-gray-400">ORDER NOT FOUND</div>;

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isPartial = (order.dueAmount ?? 0) > 0;

  return (
    <div className="max-w-2xl px-6 py-20 mx-auto">
      <div className="bg-white border-2 border-gray-50 p-8 shadow-2xl rounded-[3rem] text-center">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-green-50">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="mb-2 text-3xl italic font-black tracking-tighter text-[#3E442B] uppercase">Success!</h1>
        <p className="mb-8 font-bold text-gray-500">Order #INV-{order._id.slice(-6).toUpperCase()} is confirmed.</p>

        {isPartial && (
          <div className="mb-8 p-6 bg-pink-50 border-2 border-[#FBB6E6] rounded-[2rem] flex items-center gap-4 text-left">
            <div className="p-2 text-white bg-[#EA638C] rounded-full shadow-lg shadow-pink-200">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#EA638C] tracking-widest leading-none mb-1">Payment Notice</p>
              <p className="text-sm font-bold text-gray-800">Please pay ৳{order.dueAmount.toLocaleString()} to the rider upon delivery.</p>
            </div>
          </div>
        )}

        <button
          onClick={() => generateInvoice(order)}
          disabled={isGenerating}
          className="mb-8 flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-[#EA638C] bg-white border-2 border-pink-100 px-8 py-4 rounded-full hover:bg-[#EA638C] hover:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Download Detailed Invoice
        </button>

        <div className="bg-gray-50 rounded-[2.5rem] p-8 text-left space-y-4 mb-8 border border-gray-100">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">Cost Breakdown</h3>

          <div className="pb-4 space-y-2 border-b border-gray-200 border-dashed">
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Items Subtotal:</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1"><Truck size={14} /> Delivery Charge:</span>
              <span>+ ৳{(order.deliveryCharge ?? 0).toLocaleString()}</span>
            </div>

            {/* 🟢 Mobile Banking Fee UI */}
            {order.mobileBankingFee > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#EA638C]">
                <span className="flex items-center gap-1"><CreditCard size={14} /> Mobile Fee (1.5%):</span>
                <span>+ ৳{order.mobileBankingFee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 text-base font-black text-[#3E442B]">
              <span>Grand Total:</span>
              <span>৳{(order.totalAmount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-sm font-bold text-green-600">
              <span className="flex items-center gap-1.5"><Wallet size={14} /> Paid Online:</span>
              <span>- ৳{(order.paidAmount ?? 0).toLocaleString()}</span>
            </div>
            
            <div className={`flex justify-between text-sm font-black p-4 rounded-2xl transition-all ${isPartial ? "bg-[#3E442B] text-white shadow-xl" : "bg-gray-100 text-gray-400"}`}>
              <span className="flex items-center gap-1.5">
                <Banknote size={16} /> {isPartial ? "Cash to Pay (COD):" : "Balance Due:"}
              </span>
              <span>৳{(order.dueAmount ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/orders" className="py-4 text-[10px] font-black tracking-widest text-white uppercase bg-[#3E442B] rounded-2xl hover:opacity-90 shadow-lg shadow-gray-200 transition-all">
            My Orders
          </Link>
          <Link href="/" className="py-4 text-[10px] font-black tracking-widest text-gray-700 uppercase bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black text-[#EA638C]">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}