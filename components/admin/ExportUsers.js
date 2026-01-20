"use client";
import { Download } from "lucide-react";

export default function ExportUsers({ data, fileName = "user-directory" }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const headers = ["Name", "Email", "Phone", "Role", "Total Spent", "Joined Date"];
    
    const csvRows = data.map(user => {
      const row = [
        user.name || "N/A",
        user.email || "N/A",
        user.phone || "",
        user.role || "user",
        user.totalSpent || 0,
        new Date(user.createdAt).toLocaleDateString('en-GB')
      ];

      // 🟢 IMPROVEMENT: Escape commas and double quotes in every field
      return row.map(field => {
        const stringField = String(field).replace(/"/g, '""'); // Escape double quotes
        return `"${stringField}"`; // Wrap everything in quotes to handle commas safely
      }).join(",");
    });

    const csvContent = [headers.map(h => `"${h}"`).join(","), ...csvRows].join("\n");
    
    // Add UTF-8 BOM for proper Excel encoding of special characters (like Currency symbols)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-5 py-[14px] bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#3E442B] hover:bg-[#3E442B] hover:text-white hover:border-[#3E442B] transition-all shadow-sm group"
    >
      <Download size={16} className="transition-transform group-hover:-translate-y-0.5" />
      <span>Export CSV</span>
    </button>
  );
}