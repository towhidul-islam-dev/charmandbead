import StockAuditCard from "@/components/admin/StockAuditCard";
import InventoryMaintenance from "@/components/admin/InventoryMaintenance"; // 🟢 New Component

export default function InventoryPage() {
  return (
    <main className="min-h-screen p-4 sm:p-10 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#3E442B] uppercase tracking-tighter">
            Inventory Management
          </h1>
          <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Control your stock levels and variant synchronization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar: Health Scanner & Tools */}
          <div className="lg:col-span-4 space-y-6">
            <StockAuditCard />
            
            {/* 🟢 Added: Maintenance Tools */}
            <InventoryMaintenance />
          </div>

          {/* Main Content: Product List / Table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <h2 className="text-[#3E442B] font-black uppercase text-sm mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA638C]"></span>
                Active Stock Levels
              </h2>
              
              <div className="text-gray-300 italic text-xs py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                Your existing product/variant list will render here
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}