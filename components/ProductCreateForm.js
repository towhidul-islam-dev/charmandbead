"use client";
import { useState, useActionState, useEffect, useRef } from "react"; 
import { saveProduct } from "@/actions/product";
import { createInAppNotification } from "@/actions/inAppNotifications";
import { useNotifications } from "@/Context/NotificationContext";
import ProductCard from "@/components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import { 
  PhotoIcon, SparklesIcon, XMarkIcon, 
  PlusIcon, TagIcon, CubeIcon, CameraIcon,
  QrCodeIcon, CommandLineIcon, EyeIcon
} from "@heroicons/react/24/outline";

export default function ProductForm({ initialData, categoryStructure }) {
  const formRef = useRef(null);
  const { addNotification } = useNotifications();

  // --- STATE MANAGEMENT ---
  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  const [variants, setVariants] = useState(initialData?.variants || []);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [mainCategory, setMainCategory] = useState(initialData?.category || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");
  
  const [previewName, setPreviewName] = useState(initialData?.name || "");
  const [previewPrice, setPreviewPrice] = useState(initialData?.price || 0);

  const [state, formAction, isPending] = useActionState(saveProduct, null);

  // 🟢 LIVE PREVIEW OBJECT
  const previewProduct = {
    _id: "preview",
    name: previewName || "Product Name",
    category: subCategory || mainCategory || "Category",
    price: useVariants ? (variants[0]?.price || previewPrice) : previewPrice,
    imageUrl: mainPreview,
    isNewArrival: isNewArrival,
    createdAt: new Date(),
  };

  const handleCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory(""); 
  };

  useEffect(() => {
    const handleSuccess = async () => {
      if (state?.success && state?.message) {
        toast.success(state.message);

        if (isNewArrival) {
          const productName = previewName || "A new treasure";
          try {
            const res = await createInAppNotification({
              title: "New Arrival! 🔥",
              message: `${productName} has been added to our collection.`,
              type: "arrival",
              recipientId: "GLOBAL",
              link: state.data?._id ? `/product/${state.data._id}` : "/products"
            });
            if (res.success) addNotification(res.data);
          } catch (err) {
            console.error("Notification failed", err);
          }
        }

        if (!initialData) {
          formRef.current?.reset();
          setVariants([]);
          setMainPreview(null);
          setMainCategory("");
          setSubCategory("");
          setIsNewArrival(false);
          setPreviewName("");
          setPreviewPrice(0);
        }
      } else if (state?.message) {
        toast.error(state.message);
      }
    };

    if (state) handleSuccess();
  }, [state]);

  // --- LOGIC HELPERS ---
  const generateAutoSKUs = () => {
    const prefix = previewName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PROD";
    const newVariants = variants.map((v) => {
      if (v.sku) return v; 
      return { ...v, sku: `${prefix}-${Math.floor(100 + Math.random() * 900)}` };
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
    formData.set("price", Number(previewPrice) || 0);

    if (useVariants) {
      formData.set("variantsJson", JSON.stringify(variants.map(({ preview, ...rest }) => ({
        ...rest,
        // 🟢 SYNC WITH ORDER REGISTRY: Combines color/size for the variant display name
        name: `${rest.color} ${rest.size}`.trim() || "Default", 
        minOrderQuantity: Number(rest.minOrderQuantity) || 1,
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0
      }))));
    }
    formAction(formData);
  };

  const inputClass = "w-full bg-gray-50 border-none p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-gray-900 placeholder:text-gray-300 transition-all";
  const sectionClass = "bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6";

  return (
    <>
      <Toaster position="top-right" />
      <form ref={formRef} action={handleSubmit} className="px-4 pb-20 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="space-y-6 lg:col-span-2">
            {/* ESSENCE SECTION */}
            <section className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><TagIcon className="w-5 h-5" /></div>
                <h3 className="text-sm font-black tracking-widest text-[#3E442B] uppercase">Product Essence</h3>
              </div>
              <div className="space-y-5">
                <input type="text" name="name" value={previewName} onChange={(e) => setPreviewName(e.target.value)} required className={inputClass} placeholder="Product Name" />
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={mainCategory} onChange={handleCategoryChange} className={inputClass}>
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

            {/* INVENTORY & VARIANTS */}
            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><CubeIcon className="w-5 h-5 text-[#3E442B]" /><h3 className="text-sm font-black tracking-widest text-[#3E442B] uppercase">Inventory</h3></div>
                <div className="flex items-center gap-2">
                  {useVariants && <button type="button" onClick={generateAutoSKUs} className="px-3 py-2 bg-gray-100 text-[#3E442B] rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[#3E442B] hover:text-white transition-all"><CommandLineIcon className="w-3.5 h-3.5" /> Gen SKUs</button>}
                  <button type="button" onClick={() => setUseVariants(!useVariants)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${useVariants ? 'bg-[#EA638C] text-white' : 'bg-gray-100 text-gray-400'}`}>{useVariants ? "Disable Variants" : "Enable Variants"}</button>
                </div>
              </div>

              {!useVariants ? (
                <div className="grid grid-cols-3 gap-4">
                  <input name="price" type="number" value={previewPrice} onChange={(e) => setPreviewPrice(e.target.value)} className={inputClass} placeholder="Price" />
                  <input name="stock" type="number" defaultValue={initialData?.stock} className={inputClass} placeholder="Stock" />
                  <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} className={`${inputClass} text-[#EA638C] bg-pink-50/50`} placeholder="MOQ" />
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={i} className="relative p-4 bg-gray-50 rounded-[2rem] border border-gray-100 grid grid-cols-2 md:grid-cols-7 gap-4 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div onClick={() => document.getElementById(`v-img-${i}`).click()} className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white border-2 border-gray-200 border-dashed cursor-pointer rounded-xl">
                            {v.preview || v.imageUrl ? <img src={v.preview || v.imageUrl} className="object-cover w-full h-full" /> : <CameraIcon className="w-5 h-5 text-gray-300" />}
                          </div>
                          <input type="file" id={`v-img-${i}`} className="hidden" onChange={(e) => handlePreview(e.target.files[0], null, i)} />
                        </div>
                        <input placeholder="SKU" value={v.sku} onChange={e => { const n = [...variants]; n[i].sku = e.target.value; setVariants(n); }} className="bg-white p-3 rounded-xl text-[11px] font-bold outline-none col-span-1" />
                        <input placeholder="Size" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className="bg-white p-3 rounded-xl text-[11px] font-bold outline-none" />
                        <input placeholder="Color" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className="bg-white p-3 rounded-xl text-[11px] font-bold outline-none" />
                        <input placeholder="Price" type="number" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className="bg-white p-3 rounded-xl text-[11px] font-bold outline-none" />
                        <input placeholder="Stock" type="number" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className="bg-white p-3 rounded-xl text-[11px] font-bold outline-none" />
                        <input placeholder="MOQ" type="number" value={v.minOrderQuantity} onChange={e => { const n = [...variants]; n[i].minOrderQuantity = e.target.value; setVariants(n); }} className="bg-pink-50 p-3 rounded-xl text-[11px] font-bold text-[#EA638C] outline-none" />
                        <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="absolute p-1 text-red-400 bg-white rounded-full shadow-md -top-2 -right-2"><XMarkIcon className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" /> Add Variant Row</button>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT SIDEBAR: PREVIEW & ACTIONS */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-4 ml-4">
                <EyeIcon className="w-4 h-4 text-[#EA638C]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shop Preview</span>
              </div>
              <div className="origin-top scale-95 pointer-events-none">
                 <ProductCard product={previewProduct} />
              </div>

              <section className={`${sectionClass} mt-6`}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Main Image</h3>
                <div className="w-full h-56 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group relative" onClick={() => document.getElementById('main-img').click()}>
                  {mainPreview ? <img src={mainPreview} className="object-cover w-full h-full transition-all group-hover:scale-105" /> : <PhotoIcon className="w-12 h-12 text-gray-200" />}
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
        </div>
      </form>
    </>
  );
}