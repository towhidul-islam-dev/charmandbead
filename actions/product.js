"use server";

import { revalidatePath } from "next/cache";
import mongodb from "@/lib/mongodb";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
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
    
    // Ensure id is truly present and not just an empty string/null string
    const rawId = formData.get("id");
    const id = (rawId && rawId !== "undefined" && rawId !== "") ? rawId : null;
    
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
      // 🆕 Multilayer Category Handling
      category: formData.get("category"),       // e.g., "Beads"
      subCategory: formData.get("subCategory"), // e.g., "Crystal Beads"
      
      isNewArrival: formData.get("isNewArrival") === "true",
      isArchived: formData.get("isArchived") === "true", 
      hasVariants: hasVariants,
      imageUrl: imageUrl, 
    };

    // 2. Handling Variants vs Standard Product
    if (hasVariants) {
      const rawVariants = JSON.parse(formData.get("variantsJson") || "[]");
      
      const processedVariants = await Promise.all(rawVariants.map(async (v, index) => {
        let vImageUrl = v.imageUrl || "";
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
      // Set base product stats based on the first variant
      productData.price = processedVariants[0]?.price || 0;
      productData.stock = processedVariants.reduce((acc, curr) => acc + curr.stock, 0);
      productData.minOrderQuantity = processedVariants[0]?.minOrderQuantity || 1;
    } else {
      productData.price = Number(formData.get("price")) || 0;
      productData.stock = Number(formData.get("stock")) || 0;
      productData.minOrderQuantity = Number(formData.get("minOrderQuantity")) || 1;
      productData.variants = [];
    }

    // 3. Save or Update
    if (id) {
      await Product.findByIdAndUpdate(id, productData);
    } else {
      // Logic for new products
      const newProduct = new Product(productData);
      await newProduct.save();
    }

    // 4. Cache Clearing
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate home if it shows categories
    
    return { success: true, message: "Product saved successfully!" };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
}

// 🟢 Dedicated Action for the Admin Table Button
export async function toggleArchiveProduct(productId) {
  try {
    await mongodb();
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    product.isArchived = !product.isArchived;
    await product.save();

    revalidatePath("/admin/products");
    revalidatePath("/products"); 
    return { success: true, newState: product.isArchived };
  } catch (error) {
    console.error("Archive Error:", error);
    return { success: false, message: "Failed to toggle archive status" };
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

export async function deleteProduct(productId) {
  try {
    await mongodb();

    // 1. Find the product to get the image URL
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    // 2. Helper to extract Public ID from Cloudinary URL
    // Format: .../folder/public_id.jpg -> folder/public_id
    const extractPublicId = (url) => {
      if (!url || !url.includes("cloudinary")) return null;
      const parts = url.split("/");
      const fileName = parts.pop(); // image.jpg
      const folder = parts.pop();   // ecom-products
      return `${folder}/${fileName.split(".")[0]}`;
    };

    // 3. Delete Main Image from Cloudinary
    const mainPublicId = extractPublicId(product.imageUrl);
    if (mainPublicId) {
      await cloudinary.uploader.destroy(mainPublicId);
    }

    // 4. Delete Variant Images from Cloudinary
    if (product.hasVariants && product.variants.length > 0) {
      for (const variant of product.variants) {
        const vPublicId = extractPublicId(variant.imageUrl);
        if (vPublicId) {
          await cloudinary.uploader.destroy(vPublicId);
        }
      }
    }

    // 5. Delete from Database
    await Product.findByIdAndDelete(productId);

    // 6. Refresh Cache
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, message: "Product and images deleted permanently" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Failed to delete product" };
  }
}