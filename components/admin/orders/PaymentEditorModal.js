"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PaymentEditorModal({ order, onClose, onSave }) {
  const [customPaidInput, setCustomPaidInput] = useState(String(order.paidAmount ?? 0));
  const [savingPayment, setSavingPayment] = useState(false);

  const previewTotal = Number(order.totalAmount) || 0;
  const previewPaid = Math.max(0, Math.min(Number(customPaidInput) || 0, previewTotal));
  const previewDue = Math.max(0, Number((previewTotal - previewPaid).toFixed(2)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    await onSave(order._id, customPaidInput);
    setSavingPayment(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-black text-[#3E442B] uppercase tracking-wider">
              Adjust Payment & Due
            </h3>
            <p className="text-[10px] font-bold text-gray-400 font-mono">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-xs font-black text-[#3E442B] mt-0.5">৳{previewTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">New Paid</p>
            <p className="text-xs font-black text-emerald-600 mt-0.5">৳{previewPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">New Due</p>
            <p className="text-xs font-black text-[#EA638C] mt-0.5">৳{previewDue.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-[#3E442B] mb-1.5">
              Enter Total Paid Amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={previewTotal}
              value={customPaidInput}
              onChange={(e) => setCustomPaidInput(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-xs font-black text-[#3E442B] outline-none border border-gray-200 focus:ring-2 focus:ring-[#EA638C]/30"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingPayment}
              className="w-full py-3 bg-[#EA638C] text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
            >
              {savingPayment ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* PAYMENT EDIT HISTORY LOG */}
        {order.paymentHistory && order.paymentHistory.length > 0 && (
          <div className="pt-3 space-y-2 border-t border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#3E442B]/50">
              Payment Edit History
            </p>
            <div className="pr-1 space-y-2 overflow-y-auto max-h-36">
              {order.paymentHistory.slice().reverse().map((history, index) => (
                <div key={index} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[10px] space-y-1">
                  <div className="flex justify-between font-mono text-gray-400 text-[8px]">
                    <span>{new Date(history.updatedAt).toLocaleString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#3E442B]">
                    <span>Paid: <span className="text-gray-400 line-through">৳{history.previousPaid}</span> → <span className="text-emerald-600">৳{history.newPaid}</span></span>
                    <span>Due: <span className="text-gray-400 line-through">৳{history.previousDue}</span> → <span className="text-[#EA638C]">৳{history.newDue}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}