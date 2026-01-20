"use client";
import { useState, useActionState } from "react"; 
import { saveProduct } from "@/actions/product";
import { 
  PhotoIcon, 
  SparklesIcon, 
  XMarkIcon, 
  PlusIcon,
  ShoppingBagIcon,
  TagIcon,
  CubeIcon,
  CurrencyBangladeshiIcon
} from "@heroicons/react/24/outline";

export default function ProductForm({ initialData, categoryStructure }) {
  // Brand UI Constants
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1";
  const inputClass = "w-full bg-gray-50 border-none p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-gray-900 placeholder:text-gray-300 transition-all";
  const sectionClass = "bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6";

  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  const [variants, setVariants] = useState(initialData?.variants || []);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [mainCategory, setMainCategory] = useState(initialData?.category || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");

  const [state, formAction, isPending] = useActionState(saveProduct, null);

  const subCategoryOptions = mainCategory ? categoryStructure[mainCategory] : [];

  const handlePreview = (file, callback, index = null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      if (index !== null) {
        const newV = [...variants];
        newV[index].preview = url;
        setVariants(newV);
      } else {
        callback(url);
      }
    }
  };

  const addVariant = () => setVariants([...variants, { 
    size: "", color: "", price: "", stock: "", minOrderQuantity: 1, preview: null 
  }]);

  const handleSubmit = async (formData) => {
    formData.set("id", initialData?._id || "");
    formData.set("hasVariants", useVariants.toString());
    formData.set("isNewArrival", isNewArrival.toString());
    formData.set("existingImage", initialData?.imageUrl || "");
    formData.set("category", mainCategory);
    formData.set("subCategory", subCategory);

    if (useVariants) {
      const cleanVariants = variants.map(({ preview, ...rest }) => ({
        ...rest,
        minOrderQuantity: Number(rest.minOrderQuantity) || 1,
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0
      }));
      formData.set("variantsJson", JSON.stringify(cleanVariants));
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PRIMARY DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          <section className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><TagIcon className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Product Essence</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Product Name</label>
                <input type="text" name="name" defaultValue={initialData?.name} required className={inputClass} placeholder="Enter premium product name..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Collection / Category</label>
                  <select required value={mainCategory} onChange={(e) => { setMainCategory(e.target.value); setSubCategory(""); }} className={inputClass}>
                    <option value="">Select Main</option>
                    {Object.keys(categoryStructure).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sub-Type</label>
                  <select required value={subCategory} disabled={!mainCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass}>
                    <option value="">{mainCategory ? "Choose Type" : "Waiting for Main..."}</option>
                    {subCategoryOptions.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Story & Description</label>
                <textarea name="description" defaultValue={initialData?.description} required rows="4" className={`${inputClass} resize-none`} placeholder="Describe the materials and craftsmanship..."></textarea>
              </div>
            </div>
          </section>

          {/* INVENTORY SECTION */}
          <section className={sectionClass}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><CubeIcon className="w-5 h-5" /></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Inventory Management</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                <input type="checkbox" checked={useVariants} onChange={(e) => setUseVariants(e.target.checked)} id="variant-toggle" className="w-4 h-4 accent-[#EA638C]" />
                <label htmlFor="variant-toggle" className="text-[10px] font-black uppercase text-gray-500">Enable Multi-Variants</label>
              </div>
            </div>

            {!useVariants ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className={labelClass}>Price (৳)</label>
                  <div className="relative">
                    <CurrencyBangladeshiIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="price" type="number" defaultValue={initialData?.price} className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Stock Count</label>
                  <input name="stock" type="number" defaultValue={initialData?.stock} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Min. Order (MOQ)</label>
                  <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} className={`${inputClass} text-[#EA638C] bg-pink-50/30`} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  {variants.map((v, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-[2rem] border border-white">
                      <div className="w-14 h-14 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm shrink-0" onClick={() => document.getElementById(`v-img-${i}`).click()}>
                        {v.preview || v.imageUrl ? <img src={v.preview || v.imageUrl} className="object-cover w-full h-full" alt="" /> : <PhotoIcon className="w-6 h-6 text-gray-200" />}
                      </div>
                      <input type="file" id={`v-img-${i}`} name={`variantImage_${i}`} className="hidden" onChange={(e) => handlePreview(e.target.files[0], null, i)} />
                      
                      <input placeholder="Size" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className="bg-white border-none rounded-xl p-2.5 w-20 text-xs font-bold" />
                      <input placeholder="Color" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className="bg-white border-none rounded-xl p-2.5 w-24 text-xs font-bold" />
                      <input placeholder="Price" type="number" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className="bg-white border-none rounded-xl p-2.5 w-24 text-xs font-bold" />
                      <input placeholder="Stock" type="number" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className="bg-white border-none rounded-xl p-2.5 w-20 text-xs font-bold" />
                      
                      <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors ml-auto">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addVariant} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#EA638C] bg-pink-50 px-6 py-3 rounded-2xl hover:bg-pink-100 transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add Row
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: MEDIA & ACTIONS */}
        <div className="space-y-6">
          
          <section className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><PhotoIcon className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Visuals</h3>
            </div>
            
            <div 
              className="group relative w-full h-56 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden transition-all hover:bg-gray-100/50 cursor-pointer"
              onClick={() => document.getElementById('main-image-input').click()}
            >
              {mainPreview ? (
                <img src={mainPreview} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt="" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <PhotoIcon className="w-8 h-8 text-gray-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Cover</span>
                </div>
              )}
            </div>
            <input id="main-image-input" type="file" name="imageFile" className="hidden" onChange={(e) => handlePreview(e.target.files[0], setMainPreview)} />
          </section>

          <section className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl shadow-black/20">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <SparklesIcon className={`w-6 h-6 ${isNewArrival ? 'text-[#EA638C]' : 'text-gray-600'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Store Status</span>
               </div>
               <button type="button" onClick={() => setIsNewArrival(!isNewArrival)}
                 className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isNewArrival ? 'bg-[#EA638C]' : 'bg-gray-700'}`}
               >
                 <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${isNewArrival ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
             </div>

             <button 
               type="submit" 
               disabled={isPending}
               className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${isPending ? 'bg-gray-800 text-gray-500' : 'bg-[#EA638C] text-white hover:bg-white hover:text-black shadow-xl'}`}
             >
               {isPending ? "Syncing..." : "Save Product"}
             </button>

             {state?.message && (
               <div className={`mt-4 p-4 rounded-2xl text-[10px] font-black uppercase text-center border ${state.success ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                 {state.message}
               </div>
             )}
          </section>
        </div>
      </div>
    </form>
  );
}