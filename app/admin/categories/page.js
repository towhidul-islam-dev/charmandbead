import { getCategories } from "@/actions/category"; // Your fetch action
import CategoryManager from "@/components/admin/CategoryManager";
import CategoryStatCard from "@/components/admin/CategoryStatCard";
import { FolderIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default async function CategoriesPage() {
  const categories = await getCategories() || [];

  // Logic to calculate stats
  const totalMain = categories.filter(c => !c.parentId).length;
  const totalSub = categories.filter(c => c.parentId).length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 ml-0 md:ml-64 transition-all">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#3E442B] rounded-[2rem] text-white shadow-xl">
              <FolderIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                Architecture
              </h1>
              <p className="text-[#EA638C] font-bold text-[10px] uppercase tracking-[0.2em]">
                Structure & Hierarchy
              </p>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex gap-3">
            <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Main</p>
              <p className="text-xl font-black text-[#3E442B]">{totalMain}</p>
            </div>
            <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Sub</p>
              <p className="text-xl font-black text-[#EA638C]">{totalSub}</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* You can map through your top 3 categories here to show item counts */}
           {categories.slice(0, 3).map((cat) => (
             <CategoryStatCard 
                key={cat._id} 
                name={cat.name} 
                count={cat.productCount || 0} 
                isParent={!cat.parentId} 
             />
           ))}
        </div>

        {/* Main Management Area */}
        <section className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <ChartBarIcon className="w-5 h-5 text-[#EA638C]" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#3E442B]">
              Manage Hierarchy
            </h2>
          </div>
          
          <CategoryManager categories={categories} mode="full" />
        </section>

      </div>
    </div>
  );
}