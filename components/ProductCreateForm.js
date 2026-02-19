"use client";
import { useState, useActionState, useEffect, useRef, useMemo } from "react"; 
import { createPortal } from "react-dom";
import { saveProduct } from "@/actions/product";
import { createInAppNotification } from "@/actions/inAppNotifications";
import { useNotifications } from "@/Context/NotificationContext";
import ProductCard from "@/components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import { CATEGORY_DNA } from "@/lib/categoryDNA";
import { 
  PhotoIcon, SparklesIcon, XMarkIcon, 
  PlusIcon, TagIcon, CubeIcon, CameraIcon,
  CommandLineIcon, EyeIcon, ChevronDownIcon,
  MagnifyingGlassPlusIcon
} from "@heroicons/react/24/outline";

export default function ProductForm({ initialData }) {
  const formRef = useRef(null);
  const { addNotification } = useNotifications();

  // --- STATE MANAGEMENT ---
  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  const [variants, setVariants] = useState(initialData?.variants || []);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [mainCategory, setMainCategory] = useState(initialData?.categoryId || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategoryId || "");
  const [previewName, setPreviewName] = useState(initialData?.name || "");
  const [previewPrice, setPreviewPrice] = useState(initialData?.price || 0);
  
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
const [galleryPreviews, setGalleryPreviews] = useState(
  initialData?.gallery?.map(url => ({ 
    url: url, 
    isNew: false 
  })) || []
);
  const [state, formAction, isPending] = useActionState(saveProduct, null);

  useEffect(() => { setIsMounted(true); }, []);

  // --- DNA HIERARCHY LOGIC ---
  const getCategoryDisplayName = (id) => {
    return CATEGORY_DNA.find(c => String(c._id) === String(id))?.name || "";
  };

  const availableSubCategories = useMemo(() => {
    if (!mainCategory) return [];
    return CATEGORY_DNA.filter(c => String(c.parentId) === String(mainCategory));
  }, [mainCategory]);

  const previewProduct = {
    _id: "preview",
    name: previewName || "Product Name",
    categoryName: subCategory 
        ? getCategoryDisplayName(subCategory) 
        : (mainCategory ? getCategoryDisplayName(mainCategory) : "Category"),
    price: useVariants ? (variants[0]?.price || previewPrice) : previewPrice,
    imageUrl: mainPreview,
    isNewArrival: isNewArrival,
    createdAt: new Date(),
  };

  // --- HANDLERS ---
  const generateAutoSKUs = () => {
    if (!previewName) {
      toast.error("Enter a product name first!");
      return;
    }
    const prefix = previewName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRD";
    const newVariants = variants.map((v) => ({
      ...v, 
      sku: v.sku || `${prefix}-${Math.floor(100 + Math.random() * 900)}`
    }));
    setVariants(newVariants);
    toast.success("Batch SKUs generated! ⚡");
  };

  const handleCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory(""); 
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true
    }));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clientAction = async (formData) => {
    formData.set("id", initialData?._id || "");
    formData.set("hasVariants", useVariants.toString());
    formData.set("isNewArrival", isNewArrival.toString());
    formData.set("existingImage", initialData?.imageUrl || "");
    
    if (mainCategory) {
      formData.set("categoryId", mainCategory);
      formData.set("categoryName", getCategoryDisplayName(mainCategory));
    }
    if (subCategory) {
      formData.set("subCategoryId", subCategory);
      formData.set("subCategoryName", getCategoryDisplayName(subCategory));
    }
    
    formData.set("price", Number(previewPrice) || 0);

    const existingGallery = galleryPreviews.filter(p => !p.isNew);
    formData.set("existingGallery", JSON.stringify(existingGallery));
    
    galleryPreviews.forEach((p, i) => {
      if (p.isNew) formData.append(`galleryFile_${i}`, p.file);
    });

    if (useVariants) {
      const variantsData = variants.map(({ preview, file, ...rest }) => ({
        ...rest,
        minOrderQuantity: Number(rest.minOrderQuantity) || 1,
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0
      }));
      formData.set("variantsJson", JSON.stringify(variantsData));

      variants.forEach((v, i) => {
        if (v.file) formData.append(`variantFile_${i}`, v.file);
      });
    }
    
    formAction(formData);
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Treasure Saved! ✨");
      if (isNewArrival) {
        createInAppNotification({
          title: "New Arrival! 🔥",
          message: `${previewName || "A new treasure"} has been added.`,
          type: "arrival",
          recipientId: "GLOBAL",
          link: state.data?._id ? `/product/${state.data._id}` : "/products"
        }).then(res => res.success && addNotification(res.data));
      }
      if (!initialData) {
        setVariants([]);
        setMainPreview(null);
        setGalleryPreviews([]);
        setMainCategory("");
        setSubCategory("");
        setIsNewArrival(false);
        setPreviewName("");
        setPreviewPrice(0);
      }
    } else if (state?.success === false) {
      toast.error(state.message || "Sync failed.");
    }
  }, [state, initialData, isNewArrival, previewName, addNotification]);

  // --- STYLES ---
  const inputClass = "w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-gray-900 placeholder:text-gray-300 transition-all text-[16px] md:text-sm block";
  const sectionClass = "bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6";
  const variantInputClass = "w-full bg-white px-3 py-3 rounded-xl text-[13px] md:text-[11px] font-bold outline-none border border-transparent focus:border-[#EA638C]/20 text-gray-900";

  const PreviewModal = () => {
    if (!isMounted || !previewModalImg) return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewModalImg(null)}>
        <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setPreviewModalImg(null)} className="absolute top-5 right-5 p-2.5 bg-[#EA638C] text-white rounded-full hover:rotate-90 transition-all z-10 shadow-lg">
            <XMarkIcon className="w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex items-center justify-center p-4 bg-gray-50">
            <img src={previewModalImg} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-xl" />
          </div>
          <div className="p-4 text-center bg-white border-t border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]">Visual Inspection View</span>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <Toaster position="top-right" />
      <PreviewModal />
      <form ref={formRef} action={clientAction} className="px-4 py-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            
            <section className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><TagIcon className="w-5 h-5" /></div>
                <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Product Essence</h3>
              </div>
              <div className="space-y-5">
                <input type="text" name="name" value={previewName} onChange={(e) => setPreviewName(e.target.value)} required className={inputClass} placeholder="Product Name" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <select value={mainCategory} onChange={handleCategoryChange} className={inputClass} required>
                      <option value="">Select Category</option>
                      {CATEGORY_DNA.filter(c => !c.parentId).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                  </div>
                  <div className="relative">
                    <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} disabled={!mainCategory || availableSubCategories.length === 0}>
                        <option value="">Select Sub-Category</option>
                        {availableSubCategories.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                  </div>
                </div>
                <textarea name="description" defaultValue={initialData?.description} rows="3" className={`${inputClass} resize-none`} placeholder="Description..." required />
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <CubeIcon className="w-5 h-5 text-[#3E442B]" />
                    <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Inventory & MOQ</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {useVariants && (
                    <button type="button" onClick={generateAutoSKUs} className="px-3 py-2 bg-gray-100 text-[#3E442B] rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[#3E442B] hover:text-white transition-all">
                      <CommandLineIcon className="w-3.5 h-3.5" /> Gen SKU's
                    </button>
                  )}
                  <button type="button" onClick={() => setUseVariants(!useVariants)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${useVariants ? 'bg-[#EA638C] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {useVariants ? "Disable Variants" : "Enable Variants"}
                  </button>
                </div>
              </div>

              {!useVariants ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Unit Price</span>
                    <input name="price" type="number" step="0.01" value={previewPrice} onChange={(e) => setPreviewPrice(e.target.value)} className={inputClass} placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Total Stock</span>
                    <input name="stock" type="number" defaultValue={initialData?.stock} className={inputClass} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#EA638C] ml-2">Min. Order (MOQ)</span>
                    <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} className={`${inputClass} text-[#EA638C] bg-pink-50/50 ring-1 ring-inset ring-[#EA638C]/10`} placeholder="1" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={i} className="relative p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="flex items-center gap-4 mb-5">
                            <div 
                              onClick={() => {
                                if (v.preview || v.imageUrl) setPreviewModalImg(v.preview || v.imageUrl);
                                else document.getElementById(`v-img-${i}`).click();
                              }} 
                              className="relative flex items-center justify-center w-16 h-16 overflow-hidden bg-white border-2 border-gray-200 border-dashed cursor-pointer rounded-2xl shrink-0 group/v"
                            >
                                {v.preview || v.imageUrl ? (
                                  <>
                                    <img src={v.preview || v.imageUrl} className="object-cover w-full h-full" alt="variant" />
                                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover/v:opacity-100">
                                      <MagnifyingGlassPlusIcon className="w-5 h-5 text-white" />
                                    </div>
                                  </>
                                ) : <CameraIcon className="w-6 h-6 text-gray-300" />}
                            </div>
                            <div className="flex-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">SKU</span>
                                <input placeholder="SKU" value={v.sku} onChange={e => { const n = [...variants]; n[i].sku = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="flex gap-2">
                               <button type="button" onClick={() => document.getElementById(`v-img-${i}`).click()} className="p-2 text-[#3E442B] bg-white rounded-full shadow-sm hover:bg-gray-100">
                                  <CameraIcon className="w-5 h-5" />
                               </button>
                               <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-400 bg-white rounded-full shadow-sm hover:bg-red-50">
                                  <XMarkIcon className="w-5 h-5" />
                               </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 ml-2">Size</span>
                                <input placeholder="Size" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 ml-2">Color</span>
                                <input placeholder="Color" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 ml-2">Price</span>
                                <input placeholder="0.00" type="number" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 ml-2">Stock</span>
                                <input placeholder="0" type="number" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="col-span-2 space-y-1 lg:col-span-1">
                                <span className="text-[8px] font-black uppercase text-[#EA638C] ml-2">MOQ</span>
                                <input placeholder="1" type="number" value={v.minOrderQuantity} onChange={e => { const n = [...variants]; n[i].minOrderQuantity = e.target.value; setVariants(n); }} className={`${variantInputClass} bg-pink-50 text-[#EA638C] ring-1 ring-[#EA638C]/10`} />
                            </div>
                        </div>
                        <input type="file" id={`v-img-${i}`} className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const newV = [...variants];
                            newV[i].preview = URL.createObjectURL(file);
                            newV[i].file = file;
                            setVariants(newV);
                          }
                        }} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setVariants([...variants, { size: "", color: "", price: "", stock: "", sku: "", minOrderQuantity: 1, preview: null }])} className="w-full py-5 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" /> Add Variant Row</button>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-6">
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-4 ml-4">
                    <EyeIcon className="w-4 h-4 text-[#EA638C]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shop Preview</span>
                </div>
                <div className="mb-6 origin-top scale-95 pointer-events-none">
                    <ProductCard product={previewProduct} />
                </div>
              </div>

              <section className={sectionClass}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Main Image</h3>
                <div 
                  className="w-full h-64 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group relative" 
                  onClick={() => {
                    if (mainPreview) setPreviewModalImg(mainPreview);
                    else document.getElementById('main-img').click();
                  }}
                >
                  {mainPreview ? (
                    <>
                      <img src={mainPreview} className="object-cover w-full h-full" alt="main" />
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
                        <MagnifyingGlassPlusIcon className="w-10 h-10 text-white" />
                      </div>
                    </>
                  ) : <PhotoIcon className="w-12 h-12 text-gray-200" />}
                </div>
                <input id="main-img" name="imageFile" type="file" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setMainPreview(URL.createObjectURL(file));
                }} />
              </section>

<section className={sectionClass}>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detail Gallery</h3>
    <button type="button" onClick={() => document.getElementById('gallery-input').click()} className="text-[10px] font-black text-[#EA638C] uppercase">+ Add</button>
  </div>
  
  {/* Added the Grid Wrapper here */}
  <div 
    className="grid grid-cols-3 gap-3 min-h-[100px] p-2 rounded-2xl bg-gray-50/50 border-2 border-dashed border-transparent hover:border-[#EA638C]/20 transition-all"
    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
    onDrop={(e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files);
      const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file), isNew: true }));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }}
  >
    {galleryPreviews.length === 0 ? (
      <div className="col-span-3 flex flex-col items-center justify-center py-4 text-gray-300">
        <PhotoIcon className="w-8 h-8 opacity-20" />
        <span className="text-[8px] font-bold uppercase mt-1">Drop Images Here</span>
      </div>
    ) : (
      galleryPreviews.map((p, idx) => (
        <div key={idx} className="relative overflow-hidden border border-gray-100 aspect-square bg-white rounded-2xl group/gal shadow-sm">
          <img 
            src={p.url} 
            className="object-cover w-full h-full cursor-zoom-in" 
            alt="gallery" 
            onClick={() => setPreviewModalImg(p.url)} 
          />
          <button 
            onClick={() => removeGalleryImage(idx)} 
            type="button" 
            className="absolute p-1 transition-opacity bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 top-1 right-1 group-hover/gal:opacity-100 hover:text-red-500"
          >
            <XMarkIcon className="w-3 h-3 stroke-[3]" />
          </button>
          {p.isNew && (
            <div className="absolute bottom-1 left-1 bg-[#EA638C] text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase">
              New
            </div>
          )}
        </div>
      ))
    )}
  </div>
  <input id="gallery-input" type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryUpload} />
</section>

              <section className="bg-[#3E442B] p-8 rounded-[3rem] shadow-xl text-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className={`w-6 h-6 transition-colors ${isNewArrival ? 'text-[#EA638C]' : 'text-gray-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Mark as New Arrival</span>
                  </div>
                  <button type="button" onClick={() => setIsNewArrival(!isNewArrival)} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isNewArrival ? 'bg-[#EA638C]' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isNewArrival ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <button type="submit" disabled={isPending} className="w-full py-5 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                  {isPending ? "Syncing DNA..." : (initialData ? "Update Product" : "Save Product")}
                </button>
              </section>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}