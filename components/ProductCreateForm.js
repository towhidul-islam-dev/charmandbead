"use client";
import { useState, useActionState, useEffect, useRef, useMemo, startTransition } from "react"; 
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/actions/product";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";
import { CATEGORY_DNA } from "@/lib/categoryDNA";
import { 
  PhotoIcon, SparklesIcon, XMarkIcon, 
  PlusIcon, TagIcon, CubeIcon, CameraIcon,
  CommandLineIcon, EyeIcon,
  MagnifyingGlassPlusIcon, ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

/**
 * Image compressor to prevent server body payload limits (413 Payload Too Large)
 */
const compressImageMobileSafe = (file, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof File || file instanceof Blob) || !file.type?.startsWith("image/")) {
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

        canvas.toBlob(
          (blob) => {
            canvas.width = 0;
            canvas.height = 0;
            if (!blob) return resolve(file);

            const fileName = file.name ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : "image.jpg";
            resolve(new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() }));
          },
          "image/jpeg",
          quality
        );
      } catch {
        resolve(file);
      }
    };
    img.src = objectUrl;
  });
};

export default function ProductCreateForm({ initialData }) {
  const formRef = useRef(null);
  const galleryInputRef = useRef(null);
  const galleryReplaceInputRef = useRef(null);
  const [replacingGalleryIndex, setReplacingGalleryIndex] = useState(null);
  const router = useRouter();

  // --- FORM STATE ---
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

  const [mainCategory, setMainCategory] = useState(initialData?.categoryId || initialData?.category || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategoryId || initialData?.subCategory || "");
  const [previewName, setPreviewName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [previewPrice, setPreviewPrice] = useState(initialData?.price || 0);

  const [pricingTiers, setPricingTiers] = useState(initialData?.pricingTiers || []);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialData?.gallery?.map(url => ({ url: url, isNew: false, file: null })) || []
  );

  const [state, formAction] = useActionState(saveProduct, null);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  const generateAutoSKUs = () => {
    if (!previewName) {
      toast.error("Enter a product name first!", { position: "top-center" });
      return;
    }
    const prefix = previewName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRD";
    setVariants(prev => prev.map(v => ({
      ...v, 
      sku: v.sku || `${prefix}-${Math.floor(100 + Math.random() * 900)}`
    })));
    toast.success("Batch SKUs generated!", { position: "top-center" });
  };

  const addTier = () => setPricingTiers(prev => [...prev, { minQuantity: "", unitPrice: "" }]);
  const removeTier = (index) => setPricingTiers(prev => prev.filter((_, i) => i !== index));
  const updateTier = (index, field, value) => {
    setPricingTiers(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
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
    imageUrl: mainPreview || null,
    isNewArrival: isNewArrival,
    createdAt: new Date(),
  };

  const handleCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory(""); 
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    toast.loading("Compressing gallery images...", { id: "compress", position: "top-center" });
    const compressedList = await Promise.all(files.map(f => compressImageMobileSafe(f)));
    toast.dismiss("compress");

    const newPreviews = compressedList.map(file => ({ file, url: URL.createObjectURL(file), isNew: true }));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleGalleryReplace = async (e) => {
    const file = e.target.files?.[0];
    if (file && replacingGalleryIndex !== null) {
      toast.loading("Compressing image...", { id: "compress", position: "top-center" });
      const compressed = await compressImageMobileSafe(file);
      toast.dismiss("compress");

      setGalleryPreviews(prev => {
        const updated = [...prev];
        updated[replacingGalleryIndex] = {
          file: compressed,
          url: URL.createObjectURL(compressed),
          isNew: true
        };
        return updated;
      });
      setReplacingGalleryIndex(null);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.loading("Compressing main photo...", { id: "compress", position: "top-center" });
      const compressed = await compressImageMobileSafe(file);
      toast.dismiss("compress");

      setMainFile(compressed);
      setMainPreview(URL.createObjectURL(compressed));
    }
  };

  const removeMainImage = () => {
    setMainFile(null);
    setMainPreview(null);
  };

  const handleVariantImageChange = async (index, file) => {
    if (file) {
      toast.loading(`Compressing variant #${index + 1}...`, { id: "compress", position: "top-center" });
      const compressed = await compressImageMobileSafe(file);
      toast.dismiss("compress");

      setVariants(prev => {
        const newV = [...prev];
        newV[index].preview = URL.createObjectURL(compressed);
        newV[index].file = compressed;
        return newV;
      });
    }
  };

  const removeVariantImage = (index) => {
    setVariants(prev => {
      const newV = [...prev];
      newV[index].preview = null;
      newV[index].file = null;
      newV[index].imageUrl = null;
      return newV;
    });
  };

  const clientAction = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!previewName.trim() || !description.trim() || !mainCategory) {
      toast.error("Validation Error: Name, Description, and Category are required.", { position: "top-center" });
      return;
    }

    if (useVariants && variants.length === 0) {
      toast.error("Validation Error: Please add at least one variant row or disable variants.", { position: "top-center" });
      return;
    }

    try {
      toast.loading("Optimizing product data & uploading...", { id: "saving", position: "top-center" });

      const formData = new FormData();
      formData.set("id", initialData?._id || "");
      formData.set("name", previewName);
      formData.set("description", description);
      formData.set("category", mainCategory);
      formData.set("categoryId", mainCategory);
      formData.set("subCategoryId", subCategory || "");
      formData.set("hasVariants", String(useVariants));
      formData.set("isNewArrival", String(isNewArrival));

      // Root price and stock calculations
      const computedPrice = useVariants && variants.length > 0 
        ? Math.min(...variants.map(v => Number(v.price) || 0))
        : Number(previewPrice) || 0;

      const computedStock = useVariants && variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : Number(formRef.current?.stock?.value) || 0;

      formData.set("price", String(computedPrice));
      formData.set("stock", String(computedStock));
      formData.set("minOrderQuantity", String(!useVariants ? Number(formRef.current?.minOrderQuantity?.value) || 1 : 1));

      if (!useVariants && formRef.current?.sku?.value) {
        formData.set("sku", formRef.current.sku.value);
      } else {
        formData.set("sku", "");
      }

      // Main Image compression
      if (mainFile) {
        const finalMainFile = await compressImageMobileSafe(mainFile);
        formData.set("mainImageFile", finalMainFile);
      } else if (mainPreview) {
        formData.set("existingMainImageUrl", mainPreview);
      } else {
        formData.set("existingMainImageUrl", "");
      }

      // Gallery Images compression
      for (const item of galleryPreviews) {
        if (item.isNew && item.file) {
          const finalGalleryFile = await compressImageMobileSafe(item.file);
          formData.append("galleryFiles", finalGalleryFile);
        } else if (item.url) {
          formData.append("existingGalleryUrls", item.url);
        }
      }

      // Variants optimization
      if (useVariants) {
        const variantMetadata = variants.map((v) => ({
          sku: v.sku || "",
          size: v.size || "",
          color: v.color || "",
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          minOrderQuantity: Number(v.minOrderQuantity) || 1,
          imageUrl: v.imageUrl || null, 
        }));
        formData.set("variantData", JSON.stringify(variantMetadata));

        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (v.file) {
            const compressedVariantFile = await compressImageMobileSafe(v.file);
            formData.append(`variantFile_${i}`, compressedVariantFile);
          }
        }
      }

      formData.set("pricingTiers", JSON.stringify(pricingTiers));

      startTransition(() => {
        formAction(formData);
      });
    } catch {
      toast.dismiss("saving");
      toast.error("Submission failed. Please try again.", { position: "top-center" });
    }
  };

  useEffect(() => {
    if (state?.success) {
      toast.dismiss("saving");
      toast.success(state.message || "Product Saved Successfully!", { position: "top-center" });

      const timer = setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (state?.success === false) {
      toast.dismiss("saving");
      toast.error(state.message || "Upload failed.", { position: "top-center" });
    }
  }, [state, router]);

  const inputClass = "w-full bg-gray-50 border-none p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/30 font-bold text-gray-900 placeholder:text-gray-300 transition-all text-sm block";
  const sectionClass = "bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm mb-4 sm:mb-6";
  const variantInputClass = "w-full bg-white px-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-[11px] font-bold outline-none border border-transparent focus:border-[#EA638C]/30 text-gray-900 shadow-sm";

  const PreviewModal = () => {
    if (!isMounted || !previewModalImg) return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setPreviewModalImg(null)}>
        <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setPreviewModalImg(null)} className="absolute top-4 right-4 p-2 bg-[#EA638C] text-white rounded-full z-10 hover:bg-[#EA638C]/90 transition-all">
            <XMarkIcon className="w-5 h-5 stroke-[3]" />
          </button>
          <div className="flex items-center justify-center p-4 bg-gray-50">
            <img src={previewModalImg} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <PreviewModal />
      
      {/* Hidden inputs for gallery upload/replace */}
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleGalleryUpload} 
        multiple 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={galleryReplaceInputRef} 
        onChange={handleGalleryReplace} 
        accept="image/*" 
        className="hidden" 
      />

      <form ref={formRef} onSubmit={clientAction} className="px-2 py-4 mx-auto sm:px-4 sm:py-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            
            {/* ESSENCE SECTION */}
            <section className={sectionClass}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FBB6E6]/30 rounded-xl text-[#EA638C]">
                    <TagIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Product Essence</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isNewArrival"
                    checked={isNewArrival} 
                    onChange={(e) => setIsNewArrival(e.target.checked)} 
                    className="w-4 h-4 rounded text-[#EA638C] focus:ring-[#EA638C]"
                  />
                  <span className="text-[10px] font-black uppercase text-[#3E442B]">New Arrival</span>
                </label>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <input 
                  type="text" 
                  name="name"
                  value={previewName} 
                  onChange={(e) => setPreviewName(e.target.value)} 
                  required 
                  className={inputClass} 
                  placeholder="Product Name" 
                />
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <select name="category" value={mainCategory} onChange={handleCategoryChange} className={inputClass} required>
                    <option value="">Select Category</option>
                    {CATEGORY_DNA.filter(c => !c.parentId).map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                  <select name="subCategory" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} disabled={!mainCategory || availableSubCategories.length === 0}>
                    <option value="">Select Sub-Category</option>
                    {availableSubCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                  </select>
                </div>
                <textarea 
                  name="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3" 
                  className={`${inputClass} resize-none`} 
                  placeholder="Description..." 
                  required 
                />
              </div>
            </section>

            {/* INVENTORY SECTION */}
            <section className={sectionClass}>
              <div className="flex flex-col justify-between gap-3 mb-6 sm:gap-4 sm:mb-8 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <CubeIcon className="w-5 h-5 text-[#3E442B]" />
                  <h3 className="text-[11px] font-black tracking-widest text-[#3E442B] uppercase">Inventory & Stock</h3>
                </div>
                <div className="flex items-center gap-2">
                  {useVariants && (
                    <button type="button" onClick={generateAutoSKUs} className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#3E442B] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-[#3E442B]/90 transition-all shadow-sm">
                      <CommandLineIcon className="w-3.5 h-3.5" /> Auto SKU
                    </button>
                  )}
                  <button type="button" onClick={() => setUseVariants(!useVariants)} className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${useVariants ? 'bg-[#EA638C] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {useVariants ? "Disable Variants" : "Enable Variants"}
                  </button>
                </div>
              </div>

              {!useVariants ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 ml-2">SKU</span>
                      <input name="sku" type="text" defaultValue={initialData?.sku || ""} className={inputClass} placeholder="SKU-123" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Unit Price</span>
                      <input name="price" type="number" value={previewPrice} onChange={(e) => setPreviewPrice(e.target.value)} className={inputClass} placeholder="0.00" />
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
                      <div key={i} className="relative p-3.5 sm:p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="relative flex items-center justify-center w-14 h-14 overflow-hidden bg-white border-2 border-dashed rounded-2xl group/v shrink-0 border-[#FBB6E6]">
                              {currentImg ? (
                                <>
                                  <img src={currentImg} className="object-cover w-full h-full" alt={`Variant ${i}`} />
                                  <div className="absolute inset-0 flex items-center justify-center gap-1 transition-opacity opacity-0 group-hover/v:opacity-100 bg-black/40">
                                    <button type="button" onClick={() => setPreviewModalImg(currentImg)} className="p-1 text-gray-800 rounded-full bg-white/80 hover:bg-white">
                                      <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => document.getElementById(`v-img-${i}`).click()} className="p-1 text-gray-800 rounded-full bg-white/80 hover:bg-white">
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
                              <button type="button" onClick={() => removeVariantImage(i)} className="text-[9px] font-bold text-red-400 hover:text-red-500">
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="flex-1">
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">SKU</span>
                            <input 
                              placeholder="SKU" 
                              value={v.sku} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].sku = val; return n; });
                              }} 
                              className={variantInputClass} 
                            />
                          </div>
                          <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 transition-all bg-white rounded-full shadow-sm hover:bg-red-50"><XMarkIcon className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Size</span>
                            <input 
                              placeholder="Size" 
                              value={v.size} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].size = val; return n; });
                              }} 
                              className={variantInputClass} 
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Color</span>
                            <input 
                              placeholder="Color" 
                              value={v.color} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].color = val; return n; });
                              }} 
                              className={variantInputClass} 
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Price</span>
                            <input 
                              placeholder="Price" 
                              type="number" 
                              value={v.price} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].price = val; return n; });
                              }} 
                              className={variantInputClass} 
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 ml-1">Stock</span>
                            <input 
                              placeholder="Stock" 
                              type="number" 
                              value={v.stock} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].stock = val; return n; });
                              }} 
                              className={variantInputClass} 
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[9px] font-black uppercase text-[#EA638C] ml-1">MOQ</span>
                            <input 
                              placeholder="MOQ" 
                              type="number" 
                              value={v.minOrderQuantity} 
                              onChange={e => {
                                const val = e.target.value;
                                setVariants(prev => { const n = [...prev]; n[i].minOrderQuantity = val; return n; });
                              }} 
                              className={`${variantInputClass} bg-[#FBB6E6]/20 text-[#EA638C] ring-1 ring-[#EA638C]/20`} 
                            />
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
                  <button type="button" onClick={() => setVariants(prev => [...prev, { size: "", color: "", price: "", stock: "", sku: "", minOrderQuantity: 1, preview: null, file: null }])} className="w-full py-3.5 sm:py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-[10px] font-black uppercase text-[#3E442B] hover:bg-[#FBB6E6]/10 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-4 h-4 text-[#EA638C]" /> Add Variant Row
                  </button>
                </div>
              )}

              {/* WHOLESALE TIERS */}
              <div className="pt-4 mt-4 border-t border-gray-100 sm:pt-6 sm:mt-6">
                <div className="p-3.5 sm:p-5 border border-gray-100 bg-gray-50/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#3E442B] block">Global Wholesale Tiers</span>
                    </div>
                    <button type="button" onClick={addTier} className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 hover:underline">
                      <PlusIcon className="w-3 h-3 stroke-[3]" /> Add Tier
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="number" placeholder="Min Qty" value={tier.minQuantity} onChange={(e) => updateTier(idx, 'minQuantity', e.target.value)} className="w-1/2 p-2.5 text-xs font-bold border border-gray-200 rounded-xl bg-white text-[#3E442B] outline-none" />
                        <input type="number" placeholder="Unit Price" value={tier.unitPrice} onChange={(e) => updateTier(idx, 'unitPrice', e.target.value)} className="w-1/2 p-2.5 text-xs font-bold border-none rounded-xl bg-white text-[#EA638C] outline-none text-center" />
                        <button type="button" onClick={() => removeTier(idx)} className="p-2 text-gray-400 hover:text-red-500">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4 lg:sticky lg:top-6 sm:space-y-6">
              
              {/* PREVIEW */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-4 ml-4">
                  <EyeIcon className="w-4 h-4 text-[#EA638C]" />
                  <span className="text-[10px] font-black uppercase text-[#3E442B] tracking-widest">Shop Preview</span>
                </div>
                <div className="mb-6 origin-top scale-95 pointer-events-none">
                  <ProductCard product={previewProduct} />
                </div>
              </div>

              {/* MAIN IMAGE SECTION */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3E442B]">Main Image</h3>
                  {mainPreview && (
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => document.getElementById('main-img').click()} className="text-[10px] font-black text-[#EA638C] uppercase flex items-center gap-1 hover:underline">
                        <ArrowsRightLeftIcon className="w-3 h-3" /> Change
                      </button>
                      <button type="button" onClick={removeMainImage} className="text-[10px] font-black text-red-400 uppercase hover:text-red-500">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className="w-full h-48 sm:h-64 bg-[#3E442B]/5 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                  onClick={() => {
                    if (!mainPreview) document.getElementById('main-img').click();
                    else setPreviewModalImg(mainPreview);
                  }}
                >
                  {mainPreview ? (
                    <img src={mainPreview} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" alt="Main preview" />
                  ) : (
                    <div className="p-4 text-center">
                      <PhotoIcon className="w-10 h-10 text-[#EA638C]/40 mx-auto mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-400 block">Click to upload main photo</span>
                    </div>
                  )}
                </div>

                <input id="main-img" type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
              </section>

              {/* GALLERY SECTION */}
              <section className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase text-[#3E442B]">Gallery (Details Images)</h3>
                  <button 
                    type="button" 
                    onClick={() => galleryInputRef.current?.click()} 
                    className="px-3 py-1.5 bg-[#EA638C]/10 text-[#EA638C] rounded-xl text-[10px] font-black uppercase flex items-center gap-1 hover:bg-[#EA638C] hover:text-white transition-all"
                  >
                    <PlusIcon className="w-3.5 h-3.5 stroke-[3]" /> Add
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 p-2.5 rounded-2xl bg-gray-50/70 border border-gray-100 min-h-[110px]">
                  {galleryPreviews.map((p, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                      <img src={p.url} className="object-cover w-full h-full" alt={`Gallery ${idx}`} />
                      <div className="absolute inset-0 flex items-center justify-center gap-1 transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                        <button type="button" onClick={() => setPreviewModalImg(p.url)} className="p-1 text-gray-800 rounded-full bg-white/80 hover:bg-white">
                          <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => { setReplacingGalleryIndex(idx); galleryReplaceInputRef.current?.click(); }} className="p-1 text-gray-800 rounded-full bg-white/80 hover:bg-white">
                          <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="p-1 text-white rounded-full bg-red-500/80 hover:bg-red-500">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-4 sm:py-5 bg-[#EA638C] hover:bg-[#d4537a] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#EA638C]/30 transition-all hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Save Product</span>
                </div>
              </button>

            </div>
          </div>
        </div>
      </form>
    </>
  );
}