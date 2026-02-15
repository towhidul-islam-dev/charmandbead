import { getCategories } from "@/actions/category";
import CategoryManager from "@/components/admin/CategoryManager";
import CategoryStatCard from "@/components/admin/CategoryStatCard";
import { FolderIcon, ChartBarIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

export default async function CategoriesPage() {
  const categories = await getCategories() || [];

  // Logic to calculate stats
  const totalMain = categories.filter(c => !c.parentId).length;
  const totalSub = categories.filter(c => c.parentId).length;

  return (
    <div className="min-h-screen bg-[#FDFCFD] p-4 md:p-10 ml-0 md:ml-64 transition-all">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section: Modern & Balanced */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-[#3E442B] rounded-[2.5rem] text-white shadow-2xl shadow-[#3E442B]/20">
              <FolderIcon className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[#EA638C] font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                Store Architecture
              </p>
              <h1 className="text-4xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-none">
                Inventory <span className="text-[#EA638C]">DNA</span>
              </h1>
            </div>
          </div>

          {/* Quick Stats Summary: Minimalist Pills */}
          <div className="flex gap-2">
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#3E442B]"></span>
              <p className="text-[10px] font-black text-[#3E442B] uppercase tracking-widest">{totalMain} Main</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#EA638C]"></span>
              <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest">{totalSub} Sub</p>
            </div>
          </div>
        </header>

        {/* Main Content Grid: This solves the "Empty Left Side" issue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Stats & Insights (The area you circled) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Squares2X2Icon className="w-4 h-4 text-[#EA638C]" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Quick Insights</h2>
            </div>
            
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.slice(0, 4).map((cat) => (
                  <CategoryStatCard 
                    key={cat._id} 
                    name={cat.name} 
                    count={cat.productCount || 0} 
                    isParent={!cat.parentId} 
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  No Categories Yet
                </p>
              </div>
            )}
            
            {/* Brand Quote/Note box to fill space */}
            <div className="p-8 bg-[#3E442B] rounded-[2.5rem] text-white/80">
               <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Admin Tip</p>
               <p className="text-xs leading-relaxed font-medium italic">
                 "A clean architecture makes it easier for customers to find your charms and beads."
               </p>
            </div>
          </div>

          {/* Right Column: Management (The Heavy Lifter) */}
          <div className="lg:col-span-8">
            <section className="bg-white p-2 md:p-4 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
               {/* Aesthetic Background Element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBB6E6]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               
               <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                    <ChartBarIcon className="w-5 h-5 text-[#EA638C]" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-[#3E442B]">
                    Hierarchy Management
                    </h2>
                </div>
                
                <CategoryManager categories={categories} mode="full" />
               </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}