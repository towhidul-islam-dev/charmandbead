"use client";
import { useState, useActionState, useEffect, useRef, useMemo, startTransition } from "react"; 
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
  MagnifyingGlassPlusIcon, BanknotesIcon, ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

/**
 * HIGH-LEVEL MOBILE & DESKTOP IMAGE COMPRESSOR
 * Handles high-res camera photos from iPhone, Android, & PC automatically.
 */
const compressImageMobileSafe = (file, maxWidth = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return resolve(file);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression, fallback to JPEG
        const mimeType = "image/webp";
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to JPEG if WebP generation yields empty result
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) return resolve(file);
                  const compressedFile = new File(
                    [jpegBlob],
                    file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                    { type: "image/jpeg", lastModified: Date.now() }
                  );
                  resolve(compressedFile);
                },
                "image/jpeg",
                quality
              );
              return;
            }

            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, "") + ".webp", 
              { type: "image/webp", lastModified: Date.now() }
            );
            
            canvas.width = 0;
            canvas.height = 0;
            
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      } catch (err) {
        console.warn("Mobile canvas compression fallback triggered:", err);
        resolve(file);
      }
    };

    img.src = objectUrl;
  });
};

export default function ProductForm({ initialData }) {
  const formRef = useRef(null);
  const router = useRouter();
  const { addNotification } = useNotifications();

  // --- STATE MANAGEMENT ---
  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  
  const [variants, setVariants] = useState(
    initialData?.variants?.map(v => ({
      sku: v.sku || "",
      size: v.size || "",
      color: v.color || "",
      price: v.price || "",
      stock: v.stock || "",
      minOrderQuantity: v.minOrderQuantity || 1,
      imageUrl: v.imageUrl || null,
      preview: null,
      file: null
    })) || []
  );

  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [mainFile, setMainFile] = useState(null);

  const [mainCategory, setMainCategory] = useState(initialData?.categoryId || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategoryId || "");
  const [previewName, setPreviewName] = useState(initialData?.name || "");
  const [previewPrice, setPreviewPrice] = useState(initialData?.price || 0);

  const [pricingTiers, setPricingTiers] = useState(initialData?.pricingTiers || []);
  
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialData?.gallery?.map(url => ({ url: url, isNew: false })) || []
  );
  const [state, formAction, isPending] = useActionState(saveProduct, null);

  useEffect(() => { setIsMounted(true); }, []);

  // --- SKU GENERATOR HANDLER ---
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

  // --- GLOBAL WHOLESALE TIER HANDLERS ---
  const addTier = () => setPricingTiers([...pricingTiers, { minQuantity: "", unitPrice: "" }]);
  const removeTier = (index) => setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  const updateTier = (index, field, value) => {
    const newTiers = [...pricingTiers];
    newTiers[index][field] = value;
    setPricingTiers(newTiers);
  };

  const getBestPrice = () => {
    let basePrices = useVariants && variants.length > 0 
      ? variants.map(v => Number(v.price)).filter(p => p > 0)
      : [Number(previewPrice)];

    let tierPrices = pricingTiers.map(t => Number(t.unitPrice)).filter(p => p > 0);
    let allPrices = [...basePrices, ...tierPrices];

    return allPrices.length > 0 ? Math.min(...allPrices) : Number(previewPrice);
  };

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
    discountPrice: getBestPrice(),
    isOnSale: pricingTiers.length > 0,
    imageUrl: mainPreview,
    isNewArrival: isNewArrival,
    createdAt: new Date(),
  };

  // --- FORM HANDLERS ---
  const handleCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory(""); 
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file), isNew: true }));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- MAIN IMAGE CHANGE HANDLER ---
  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainFile(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const removeMainImage = () => {
    setMainFile(null);
    setMainPreview(null);
  };

  // --- VARIANT IMAGE CHANGE HANDLER ---
  const handleVariantImageChange = (index, file) => {
    if (file) {
      const newV = [...variants];
      newV[index].preview = URL.createObjectURL(file);
      newV[index].file = file;
      setVariants(newV);
    }
  };

  const removeVariantImage = (index) => {
    const newV = [...variants];
    newV[index].preview = null;
    newV[index].file = null;
    newV[index].imageUrl = null;
    setVariants(newV);
  };

  // --- CLIENT SUBMISSION HANDLER ---
  const clientAction = async (formData) => {
    try {
      toast.loading("Compressing & optimizing images...", { id: "saving" });

      formData.set("id", initialData?._id || "");
      formData.set("hasVariants", useVariants.toString());
      formData.set("isNewArrival", isNewArrival.toString());
      
      // Process Main Image
      if (mainFile) {
        const compressedMain = await compressImageMobileSafe(mainFile, 1200, 0.75);
        formData.append("mainImage", compressedMain);
      } else {
        formData.set("imageUrl", mainPreview || "");
      }
      
      // Wholesale Tiers
      const validTiers = pricingTiers
        .map(t => ({ minQuantity: Number(t.minQuantity) || 0, unitPrice: Number(t.unitPrice) || 0 }))
        .filter(t => t.minQuantity > 0 && t.unitPrice > 0);
      formData.set("pricingTiers", JSON.stringify(validTiers));

      if (mainCategory) {
        formData.set("categoryId", mainCategory);
        formData.set("categoryName", getCategoryDisplayName(mainCategory));
      }
      if (subCategory) {
        formData.set("subCategoryId", subCategory);
        formData.set("subCategoryName", getCategoryDisplayName(subCategory));
      }
      
      formData.set("price", Number(previewPrice) || 0);
      
      // Process Gallery Images
      const existingGallery = galleryPreviews.filter(p => !p.isNew);
      formData.set("existingGallery", JSON.stringify(existingGallery));
      
      for (let i = 0; i < galleryPreviews.length; i++) {
        const p = galleryPreviews[i];
        if (p.isNew && p.file) {
          const compressedGalleryImg = await compressImageMobileSafe(p.file, 1000, 0.7);
          formData.append(`galleryFile_${i}`, compressedGalleryImg);
        }
      }

      // Process Variants
      if (useVariants) {
        const variantsData = variants.map(({ preview, file, ...rest }) => ({
          ...rest,
          minOrderQuantity: Number(rest.minOrderQuantity) || 1,
          price: Number(rest.price) || 0,
          stock: Number(rest.stock) || 0,
        }));
        formData.set("variantsJson", JSON.stringify(variantsData));
        
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (v.file) {
            const compressedVariantImg = await compressImageMobileSafe(v.file, 800, 0.65);
            formData.append(`variantFile_${i}`, compressedVariantImg);
            
            if (i > 0 && i % 3 === 0) {
              await new Promise(r => setTimeout(r, 50));
            }
          }
        }
      }

      toast.dismiss("saving");
      toast.loading("Uploading to server...", { id: "saving" });
      
      startTransition(() => {
        formAction(formData);
      });
    } catch (err) {
      toast.dismiss("saving");
      toast.error("Upload failed. Try reducing photo sizes or count.");
      console.error("Mobile upload process error:", err);
    }
  };

  useEffect(() => {
    if (state?.success) {
      toast.dismiss("saving");
      toast.success(state.message || "Product Saved Successfully! ✨");

      formRef.current?.reset();

      setUseVariants(false);
      setVariants([]);
      setIsNewArrival(false);
      setMainPreview(null);
      setMainFile(null);
      setMainCategory("");
      setSubCategory("");
      setPreviewName("");
      setPreviewPrice(0);
      setPricingTiers([]);
      setGalleryPreviews([]);

      const timer = setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (state?.success === false) {
      toast.dismiss("saving");
      toast.error(state.message || "Upload failed.");
    }
  }, [state, router]);

  const inputClass = "w-full bg-gray-50 border-none p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/30 font-bold text-gray-900 placeholder:text-gray-300 transition-all text-sm block";
  const sectionClass = "bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm mb-4 sm:mb-6";
  const variantInputClass = "w-full bg-white px-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-[11px] font-bold outline-none border border-transparent focus:border-[#EA638C]/30 text-gray-900 shadow-sm";

  const PreviewModal = () => {
    if (!isMounted || !previewModalImg) return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewModalImg(null)}>
        <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setPreviewModalImg(null)} className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 sm:p-2.5 bg-[#EA638C] text-white rounded-full hover:rotate-90 transition-all z-10 shadow-lg">
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
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
      <form ref={formRef} action={clientAction} className="px-2 sm:px-4 py-4 sm:py-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            
            <section className={sectionClass}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-[#FBB6E6]/30 rounded-xl text-[#EA638C]">
                  <TagIcon className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Product Essence</h3>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <input type="text" value={previewName} onChange={(e) => setPreviewName(e.target.value)} name="name" required className={inputClass} placeholder="Product Name" />
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <select value={mainCategory} onChange={handleCategoryChange} className={inputClass} required>
                    <option value="">Select Category</option>
                    {CATEGORY_DNA.filter(c => !c.parentId).map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                  <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} disabled={!mainCategory || availableSubCategories.length === 0}>
                    <option value="">Select Sub-Category</option>
                    {availableSubCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                  </select>
                </div>
                <textarea name="description" defaultValue={initialData?.description} rows="3" className={`${inputClass} resize-none`} placeholder="Description..." required />
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex flex-col justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <CubeIcon className="w-5 h-5 text-[#3E442B]" />
                    <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Inventory & Stock</h3>
                </div>
                <div className="flex items-center gap-2">
                  {useVariants && (
                    <button type="button" onClick={generateAutoSKUs} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#3E442B] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-[#3E442B]/90 transition-all shadow-sm">
                        <CommandLineIcon className="w-3.5 h-3.5" /> Auto SKU
                    </button>
                  )}
                  <button type="button" onClick={() => setUseVariants(!useVariants)} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] font-black uppercase transition-all ${useVariants ? 'bg-[#EA638C] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {useVariants ? "Disable Variants" : "Enable Variants"}
                  </button>
                </div>
              </div>

              {!useVariants ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Unit Price</span>
                      <input type="number" value={previewPrice} onChange={(e) => setPreviewPrice(e.target.value)} className={inputClass} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Total Stock</span>
                      <input name="stock" type="number" defaultValue={initialData?.stock} className={inputClass} placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-[#EA638C] ml-2">Min. Order (MOQ)</span>
                      <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} className={`${inputClass} text-[#EA638C] bg-[#FBB6E6]/20 ring-1 ring-[#EA638C]/20`} placeholder="1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {variants.map((v, i) => {
                    const currentImg = v.preview || v.imageUrl;
                    return (
                      <div key={i} className="relative p-3.5 sm:p-5 bg-gray-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 overflow-hidden bg-white border-2 border-dashed rounded-2xl group/v shrink-0 border-[#FBB6E6]">
                              {currentImg ? (
                                <>
                                  <img src={currentImg} className="object-cover w-full h-full" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/v:opacity-100 bg-black/40 gap-1 transition-opacity">
                                    <button type="button" onClick={() => setPreviewModalImg(currentImg)} title="View" className="p-1 bg-white/80 rounded-full text-gray-800 hover:bg-white">
                                      <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => document.getElementById(`v-img-${i}`).click()} title="Change" className="p-1 bg-white/80 rounded-full text-gray-800 hover:bg-white">
                                      <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <button type="button" onClick={() => document.getElementById(`v-img-${i}`).click()} className="flex items-center justify-center w-full h-full">
                                  <CameraIcon className="w-6 h-6 text-[#EA638C]/50" />
                                </button>
                              )}
                            </div>
                            {currentImg && (
                              <button type="button" onClick={() => removeVariantImage(i)} className="text-[9px] font-bold text-red-400 hover:text-red-600">
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="flex-1">
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">SKU</span>
                            <input placeholder="SKU" value={v.sku} onChange={e => { const n = [...variants]; n[i].sku = e.target.value; setVariants(n); }} className={variantInputClass} />
                          </div>
                          <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-400 transition-all bg-white rounded-full shadow-sm hover:bg-red-50"><XMarkIcon className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Size</span>
                              <input placeholder="Size" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Color</span>
                              <input placeholder="Color" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Price</span>
                              <input placeholder="Price" type="number" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Stock</span>
                              <input placeholder="Stock" type="number" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className={variantInputClass} />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[9px] font-black uppercase text-[#EA638C] ml-1">MOQ</span>
                              <input placeholder="MOQ" type="number" value={v.minOrderQuantity} onChange={e => { const n = [...variants]; n[i].minOrderQuantity = e.target.value; setVariants(n); }} className={`${variantInputClass} bg-[#FBB6E6]/20 text-[#EA638C] ring-1 ring-[#EA638C]/20`} />
                            </div>
                        </div>

                        <input 
                          type="file" 
                          id={`v-img-${i}`} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleVariantImageChange(i, e.target.files?.[0])} 
                        />
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setVariants([...variants, { size: "", color: "", price: "", stock: "", sku: "", minOrderQuantity: 1, preview: null, file: null }])} className="w-full py-4 sm:py-5 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-[2.5rem] text-[10px] font-black uppercase text-[#3E442B] hover:bg-[#FBB6E6]/10 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-4 h-4 text-[#EA638C]" /> Add Row
                  </button>
                </div>
              )}

              {/* Wholesale Tiers Block */}
              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100">
                <div className="p-3.5 sm:p-5 border border-gray-100 bg-gray-50/50 rounded-2xl sm:rounded-3xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#3E442B] block">Global Wholesale Tiers</span>
                      <span className="text-[9px] font-semibold text-gray-400 block">Applies across all variants & base pricing</span>
                    </div>
                    <button type="button" onClick={addTier} className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 hover:scale-105 transition-transform">
                      <PlusIcon className="w-3 h-3 stroke-[3]" /> Add Tier
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-2">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <input type="number" placeholder="Min Qty" value={tier.minQuantity} onChange={(e) => updateTier(idx, 'minQuantity', e.target.value)} className="w-1/2 p-2.5 sm:p-3 text-sm sm:text-[11px] font-bold border border-gray-200 rounded-xl bg-white shadow-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#EA638C]/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <input type="number" placeholder="Unit Price" value={tier.unitPrice} onChange={(e) => updateTier(idx, 'unitPrice', e.target.value)} className="w-1/2 p-2.5 sm:p-3 text-[11px] font-bold border-none rounded-xl bg-white shadow-sm text-[#EA638C] outline-none focus:ring-1 focus:ring-[#EA638C]/30" />
                        <button type="button" onClick={() => removeTier(idx)} className="p-2 text-gray-400 transition-opacity opacity-80 group-hover:opacity-100 hover:text-red-500">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {pricingTiers.length === 0 && (
                      <p className="text-[10px] font-semibold text-gray-300 italic text-center py-2">No wholesale discount tiers added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="lg:sticky lg:top-6">
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-4 ml-4">
                  <EyeIcon className="w-4 h-4 text-[#EA638C]" /><span className="text-[10px] font-black uppercase text-[#3E442B] tracking-widest">Shop Preview</span>
                </div>
                <div className="mb-6 origin-top scale-95 pointer-events-none">
                  <ProductCard product={previewProduct} />
                </div>
              </div>

              <section className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3E442B]">Main Image</h3>
                  {mainPreview && (
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => document.getElementById('main-img').click()} className="text-[10px] font-black text-[#EA638C] uppercase flex items-center gap-1">
                        <ArrowsRightLeftIcon className="w-3 h-3" /> Change
                      </button>
                      <button type="button" onClick={removeMainImage} className="text-[10px] font-black text-red-400 uppercase">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className="w-full h-48 sm:h-64 bg-[#3E442B]/5 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                  onClick={() => {
                    if (!mainPreview) {
                      document.getElementById('main-img').click();
                    } else {
                      setPreviewModalImg(mainPreview);
                    }
                  }}
                >
                  {mainPreview ? (
                    <>
                      <img src={mainPreview} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 gap-2 transition-opacity">
                        <span className="p-2 bg-white/90 rounded-full text-gray-800 shadow-md">
                          <MagnifyingGlassPlusIcon className="w-6 h-6" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#EA638C]/40 mx-auto mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-400">Click to upload photo</span>
                    </div>
                  )}
                </div>

                <input 
                  id="main-img" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleMainImageChange} 
                />
              </section>

              <section className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase text-[#3E442B]">Gallery</h3>
                  <button type="button" onClick={() => document.getElementById('gallery-input').click()} className="text-[10px] font-black text-[#EA638C] uppercase">+ Add</button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 min-h-[90px] sm:min-h-[100px] p-2 rounded-2xl bg-gray-50/50 border-2 border-dashed border-transparent hover:border-[#EA638C]/30 transition-all">
                  {galleryPreviews.map((p, idx) => (
                    <div key={idx} className="relative overflow-hidden bg-white border border-gray-100 shadow-sm aspect-square rounded-2xl group/gal">
                      <img src={p.url} className="object-cover w-full h-full cursor-zoom-in" onClick={() => setPreviewModalImg(p.url)} />
                      <button onClick={() => removeGalleryImage(idx)} type="button" className="absolute p-1 transition-opacity rounded-full opacity-0 top-1 right-1 bg-white/90 group-hover/gal:opacity-100"><XMarkIcon className="w-3 h-3 stroke-[3]" /></button>
                    </div>
                  ))}
                </div>
                <input id="gallery-input" type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryUpload} />
              </section>

              <section className="bg-[#3E442B] p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl text-white">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <SparklesIcon className={`w-6 h-6 ${isNewArrival ? 'text-[#FBB6E6]' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">New Arrival</span>
                  </div>
                  <button type="button" onClick={() => setIsNewArrival(!isNewArrival)} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isNewArrival ? 'bg-[#EA638C]' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isNewArrival ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <button type="submit" disabled={isPending} className="w-full py-4 sm:py-5 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50">
                  {isPending ? "Syncing DNA...." : (initialData?._id ? "Update Product" : "Save Product")}
                </button>
              </section>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}