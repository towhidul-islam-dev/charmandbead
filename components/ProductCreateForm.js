"use client";
import { useState, useActionState, useEffect, useRef } from "react"; 
import { saveProduct } from "@/actions/product";
import toast, { Toaster } from "react-hot-toast";
import { 
  PhotoIcon, SparklesIcon, XMarkIcon, 
  PlusIcon, TagIcon, CubeIcon, CameraIcon,
  QrCodeIcon, CommandLineIcon // 🟢 CommandLineIcon for the auto-gen button
} from "@heroicons/react/24/outline";

export default function ProductForm({ initialData, categoryStructure }) {
  const formRef = useRef(null);

  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  const [variants, setVariants] = useState(initialData?.variants || []);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [mainCategory, setMainCategory] = useState(initialData?.category || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");

  const [state, formAction, isPending] = useActionState(saveProduct, null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        if (!initialData) {
          formRef.current?.reset();
          setVariants([]);
          setMainPreview(null);
          setMainCategory("");
          setSubCategory("");
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, initialData]);

  // 🟢 LOGIC: Batch SKU Generator (Preserves existing data)
 const generateAutoSKUs = () => {
  const productName = formRef.current?.name.value || "PROD";
  const prefix = productName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  
  const newVariants = variants.map((v, index) => {
    if (v.sku) return v; 
    const colorPart = v.color ? `-${v.color.replace(/\s+/g, "").slice(0, 3).toUpperCase()}` : "";
    const sizePart = v.size ? `-${v.size.replace(/\s+/g, "").slice(0, 2).toUpperCase()}` : "";
    
    // Using index + timestamp for a truly unique but short ID
    const uniqueId = Math.floor(100 + Math.random() * 900); 
    return { ...v, sku: `${prefix}${colorPart}${sizePart}-${uniqueId}` };
  });
  
  setVariants(newVariants);
  toast.success("Batch SKUs generated!");
};
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
    size: "", color: "", price: "", stock: "", sku: "", minOrderQuantity: 1, preview: null 
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
        sku: rest.sku || "",
        minOrderQuantity: Number(rest.minOrderQuantity) || 1,
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0
      }));
      formData.set("variantsJson", JSON.stringify(cleanVariants));
    }
    formAction(formData);
  };

  const inputClass = "w-full bg-gray-50 border-none p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-gray-900 placeholder:text-gray-300 transition-all";
  const sectionClass = "bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6";

  return (
    <>
      <Toaster position="top-right" />
      <form ref={formRef} action={handleSubmit} className="mx-auto max-w-7xl pb-20 px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="space-y-6 lg:col-span-2">
            <section className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><TagIcon className="w-5 h-5" /></div>
                <h3 className="text-sm font-black tracking-widest text-[#3E442B] uppercase">Product Essence</h3>
              </div>
              <div className="space-y-5">
                <input type="text" name="name" defaultValue={initialData?.name} required className={inputClass} placeholder="Product Name" />
                
                {!useVariants && (
                  <div className="relative">
                    {/* 🟢 FIXED: BarcodeIcon replaced with QrCodeIcon to solve build error */}
                    <QrCodeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input type="text" name="sku" defaultValue={initialData?.sku} className={`${inputClass} pl-12`} placeholder="Product SKU" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <select value={mainCategory} onChange={(e) => setMainCategory(e.target.value)} className={inputClass}>
                    <option value="">Category</option>
                    {Object.keys(categoryStructure).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} disabled={!mainCategory}>
                    <option value="">Sub-Category</option>
                    {(mainCategory ? categoryStructure[mainCategory] : []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <textarea name="description" defaultValue={initialData?.description} rows="3" className={`${inputClass} resize-none`} placeholder="Description..." />
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><CubeIcon className="w-5 h-5 text-blue-600" /><h3 className="text-sm font-black tracking-widest text-[#3E442B] uppercase">Inventory</h3></div>
                
                {/* 🟢 UI: Buttons grouped together to keep existing design clean */}
                <div className="flex items-center gap-2">
                  {useVariants && variants.length > 0 && (
                    <button type="button" onClick={generateAutoSKUs} className="px-3 py-2 bg-gray-100 text-[#3E442B] rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[#3E442B] hover:text-white transition-all">
                      <CommandLineIcon className="w-3.5 h-3.5" /> Gen SKUs
                    </button>
                  )}
                  <button type="button" onClick={() => setUseVariants(!useVariants)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${useVariants ? 'bg-[#EA638C] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {useVariants ? "Disable Variants" : "Enable Variants"}
                  </button>
                </div>
              </div>

              {!useVariants ? (
                <div className="grid grid-cols-3 gap-4">
                  <input name="price" type="number" defaultValue={initialData?.price} className={inputClass} placeholder="Price" />
                  <input name="stock" type="number" defaultValue={initialData?.stock} className={inputClass} placeholder="Stock" />
                  <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} className={`${inputClass} text-[#EA638C] bg-pink-50/50`} placeholder="MOQ" />
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={i} className="relative p-4 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center">
                        {/* Variant Photo */}
                        <div className="flex flex-col items-center gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400">Photo</label>
                          <div onClick={() => document.getElementById(`v-img-${i}`).click()} className="w-12 h-12 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden">
                            {v.preview || v.imageUrl ? <img src={v.preview || v.imageUrl} className="w-full h-full object-cover" /> : <CameraIcon className="w-5 h-5 text-gray-300" />}
                          </div>
                          <input type="file" id={`v-img-${i}`} name={`variantImage_${i}`} className="hidden" onChange={(e) => handlePreview(e.target.files[0], null, i)} />
                        </div>
                        {/* SKU Field (Preserving Row UI) */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">SKU</label>
                          <input placeholder="Code" value={v.sku} onChange={e => { const n = [...variants]; n[i].sku = e.target.value; setVariants(n); }} className="w-full bg-white p-3 rounded-xl text-[11px] font-bold outline-none border-none" />
                        </div>
                        {/* Size/Color/Price/Stock/MOQ (No UI changes) */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Size</label>
                          <input placeholder="XL" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className="w-full bg-white p-3 rounded-xl text-[11px] font-bold outline-none border-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Color</label>
                          <input placeholder="Red" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className="w-full bg-white p-3 rounded-xl text-[11px] font-bold outline-none border-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Price</label>
                          <input type="number" placeholder="0" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className="w-full bg-white p-3 rounded-xl text-[11px] font-bold outline-none border-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 ml-2">Stock</label>
                          <input type="number" placeholder="0" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className="w-full bg-white p-3 rounded-xl text-[11px] font-bold outline-none border-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-black uppercase text-[#EA638C] ml-2">MOQ</label>
                          <input type="number" value={v.minOrderQuantity} onChange={e => { const n = [...variants]; n[i].minOrderQuantity = e.target.value; setVariants(n); }} className="w-full bg-pink-50 p-3 rounded-xl text-[11px] font-bold text-[#EA638C] outline-none border-none" />
                        </div>
                      </div>
                      <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-white shadow-md text-red-400 p-1 rounded-full"><XMarkIcon className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Add Variant Row
                  </button>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className={sectionClass}>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Main Image</h3>
               <div className="w-full h-56 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group relative" onClick={() => document.getElementById('main-img').click()}>
                  {mainPreview ? <img src={mainPreview} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <PhotoIcon className="w-12 h-12 text-gray-200" />}
               </div>
               <input id="main-img" name="imageFile" type="file" className="hidden" onChange={(e) => handlePreview(e.target.files[0], setMainPreview)} />
            </section>

            <section className="bg-[#3E442B] p-8 rounded-[3rem] shadow-xl text-white">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <SparklesIcon className={`w-6 h-6 ${isNewArrival ? 'text-[#EA638C]' : 'text-gray-600'}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest">New Arrival</span>
                  </div>
                  <button type="button" onClick={() => setIsNewArrival(!isNewArrival)} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isNewArrival ? 'bg-[#EA638C]' : 'bg-gray-700'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isNewArrival ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
               <button type="submit" disabled={isPending} className="w-full py-5 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Product"}
               </button>
            </section>
          </div>
        </div>
      </form>
    </>
  );
}