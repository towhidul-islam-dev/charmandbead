"use client";
import { useState } from "react";
import { useFormState } from "react-dom"; 
import { saveProduct } from "@/actions/product";
import { PhotoIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProductForm({ initialData, categories }) {
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500";

  const [useVariants, setUseVariants] = useState(initialData?.hasVariants || false);
  const [variants, setVariants] = useState(initialData?.variants || []);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [mainPreview, setMainPreview] = useState(initialData?.imageUrl || null);
  const [state, formAction] = useFormState(saveProduct, null);

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
    size: "", 
    color: "", 
    price: "", 
    stock: "", 
    minOrderQuantity: 1, 
    preview: null 
  }]);

  // --- UPDATED SUBMIT LOGIC WITH LOGS ---
  const handleSubmit = async (formData) => {
    formData.set("id", initialData?._id || "");
    formData.set("hasVariants", useVariants.toString());
    formData.set("isNewArrival", isNewArrival.toString());
    formData.set("existingImage", initialData?.imageUrl || "");
    
    let debugData = {
      name: formData.get("name"),
      category: formData.get("category"),
      hasVariants: useVariants,
    };

    if (useVariants) {
      const cleanVariants = variants.map(({ preview, ...rest }) => ({
        ...rest,
        minOrderQuantity: Number(rest.minOrderQuantity) || 1,
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0
      }));
      formData.set("variantsJson", JSON.stringify(cleanVariants));
      debugData.variants = cleanVariants;
    } else {
      const moq = Number(formData.get("minOrderQuantity")) || 1;
      formData.set("minOrderQuantity", moq.toString());
      debugData.price = formData.get("price");
      debugData.minOrderQuantity = moq;
    }

    // --- THE LOG: Check your Browser Console (F12) to see this! ---
    console.log("🚀 FORM SUBMISSION DATA:", debugData);
    
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      
      {/* Name & Category Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Product Name</label>
          <input type="text" name="name" defaultValue={initialData?.name} required className={inputClass} placeholder="Product Name" />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={initialData?.category} required className={`bg-white ${inputClass}`}>
            <option value="">Select Category</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" defaultValue={initialData?.description} required rows="3" className={inputClass} placeholder="Details..."></textarea>
      </div>

      {/* New Arrival Toggle UI */}
      <div className={`p-5 border rounded-2xl flex items-center justify-between transition-colors ${isNewArrival ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`${isNewArrival ? 'bg-blue-600' : 'bg-gray-400'} p-2 rounded-lg transition-colors`}>
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className={`text-md font-bold ${isNewArrival ? 'text-blue-900' : 'text-gray-700'}`}>New Arrival / Upcoming</h3>
        </div>
        <button type="button" onClick={() => setIsNewArrival(!isNewArrival)}
          className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors ${isNewArrival ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <div className={`bg-white w-5 h-5 rounded-full shadow transition-transform ${isNewArrival ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Variant Toggle */}
      <div className="flex items-center gap-2 p-4 border border-gray-300 border-dashed bg-gray-50 rounded-xl">
        <input type="checkbox" checked={useVariants} onChange={(e) => setUseVariants(e.target.checked)} id="variant-toggle" className="w-4 h-4" />
        <label htmlFor="variant-toggle" className="font-bold text-gray-700">This product has multiple sizes or colors</label>
      </div>

      {/* Pricing & MOQ Section */}
      {!useVariants ? (
        <div className="grid grid-cols-3 gap-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
          <div>
            <label className={labelClass}>Price (৳)</label>
            <input name="price" type="number" defaultValue={initialData?.price} placeholder="Price" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input name="stock" type="number" defaultValue={initialData?.stock} placeholder="Stock" className={inputClass} />
          </div>
          <div>
            <label className={`${labelClass} text-blue-700`}>Min. Order (MOQ)</label>
            <input name="minOrderQuantity" type="number" defaultValue={initialData?.minOrderQuantity || 1} min="1" className={`${inputClass} border-blue-300 font-bold`} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button type="button" onClick={addVariant} className="px-4 py-2 text-sm text-white transition-opacity bg-black rounded hover:opacity-80">
            + Add Variant Row
          </button>
          
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-3 border rounded-xl bg-gray-50">
                <div 
                  className="flex items-center justify-center w-10 h-10 overflow-hidden bg-white border rounded cursor-pointer shrink-0"
                  onClick={() => document.getElementById(`v-img-${i}`).click()}
                >
                  {v.preview || v.imageUrl ? (
                    <img src={v.preview || v.imageUrl} className="object-cover w-full h-full" />
                  ) : (
                    <PhotoIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <input type="file" id={`v-img-${i}`} name={`variantImage_${i}`} className="hidden" onChange={(e) => handlePreview(e.target.files[0], null, i)} />

                <input placeholder="Size" value={v.size} onChange={e => { const n = [...variants]; n[i].size = e.target.value; setVariants(n); }} className="border p-1.5 w-20 rounded text-sm" />
                <input placeholder="Color" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className="border p-1.5 w-24 rounded text-sm" />
                <input placeholder="Price" type="number" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className="border p-1.5 w-24 rounded text-sm" />
                <input placeholder="Stock" type="number" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className="border p-1.5 w-20 rounded text-sm" />
                
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-blue-500 ml-1">MOQ</span>
                  <input placeholder="MOQ" type="number" min="1" value={v.minOrderQuantity} onChange={e => { const n = [...variants]; n[i].minOrderQuantity = e.target.value; setVariants(n); }} className="border-2 border-blue-200 p-1.5 w-16 rounded text-sm bg-blue-50 font-bold" />
                </div>

                <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-1 ml-auto text-red-500 rounded hover:bg-red-50">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Image Selection */}
      <div>
        <label className={labelClass}>Main Display Image</label>
        <div 
          className="flex items-center justify-center w-full h-40 mb-2 overflow-hidden transition-colors border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          onClick={() => document.getElementById('main-image-input').click()}
        >
          {mainPreview ? (
            <img src={mainPreview} className="object-contain h-full" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <PhotoIcon className="w-8 h-8" />
              <span className="text-xs font-bold tracking-tighter uppercase">Click to select image</span>
            </div>
          )}
        </div>
        <input id="main-image-input" type="file" name="imageFile" className="hidden" onChange={(e) => handlePreview(e.target.files[0], setMainPreview)} />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-[0.99]">
        Save Product Data
      </button>

      {state?.message && (
        <p className={`text-center text-sm font-semibold p-3 rounded-lg ${state.success ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}