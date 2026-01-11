"use server";

import { revalidatePath } from "next/cache";
import mongodb from "@/lib/mongodb";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file) {
  if (!file || file.size === 0 || typeof file === "string") return null;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "ecom-products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url); 
      }
    ).end(buffer);
  });
}

export async function saveProduct(prevState, formData) {
  try {
    await mongodb();
    const id = formData.get("id");
    const hasVariants = formData.get("hasVariants") === "true";

    // 1. Handle Main Image Upload
    let imageUrl = formData.get("existingImage") || "";
    const mainImageFile = formData.get("imageFile");
    if (mainImageFile && mainImageFile instanceof File && mainImageFile.size > 0) {
      const uploadedUrl = await uploadToCloudinary(mainImageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    let productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      isNewArrival: formData.get("isNewArrival") === "true",
      hasVariants: hasVariants,
      imageUrl: imageUrl, 
    };

    // 2. Handling Variants vs Standard Product
    if (hasVariants) {
      const rawVariants = JSON.parse(formData.get("variantsJson") || "[]");
      
      // Process each variant to check for new images
      const processedVariants = await Promise.all(rawVariants.map(async (v, index) => {
        let vImageUrl = v.imageUrl || "";
        
        // Check if a specific file was uploaded for this variant index
        const variantFile = formData.get(`variantImage_${index}`);
        if (variantFile && variantFile instanceof File && variantFile.size > 0) {
          const uploadedVUrl = await uploadToCloudinary(variantFile);
          if (uploadedVUrl) vImageUrl = uploadedVUrl;
        }

        return {
          ...v,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          minOrderQuantity: Number(v.minOrderQuantity) || 1,
          imageUrl: vImageUrl
        };
      }));

      productData.variants = processedVariants;
      productData.price = processedVariants[0]?.price || 0;
      productData.stock = processedVariants.reduce((acc, curr) => acc + curr.stock, 0);
      productData.minOrderQuantity = processedVariants[0]?.minOrderQuantity || 1;
    } else {
      productData.price = Number(formData.get("price")) || 0;
      productData.stock = Number(formData.get("stock")) || 0;
      productData.minOrderQuantity = Number(formData.get("minOrderQuantity")) || 1;
      productData.variants = [];
    }

    // --- DEBUG LOG ---
    console.log("🚀 SAVING TO DB:", JSON.stringify(productData, null, 2));

    if (id) {
      await Product.findByIdAndUpdate(id, productData);
    } else {
      await new Product(productData).save();
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, message: "Product saved successfully!" };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, message: error.message };
  }
}

export async function removeFromNewArrivals(productId) {
  try {
    await mongodb();
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isNewArrival: false },
      { new: true }
    );
    if (!updatedProduct) return { success: false, message: "Product not found" };

    revalidatePath("/admin/new-arrivals");
    revalidatePath("/admin/products");
    return { success: true, message: "Removed from New Arrivals" };
  } catch (error) {
    return { success: false, message: "Failed to remove product" };
  }
}