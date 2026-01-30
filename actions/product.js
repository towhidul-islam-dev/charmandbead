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
    cloudinary.uploader
      .upload_stream({ folder: "ecom-products" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function silentInventoryHeal() {
  try {
    await mongodb();
    const products = await Product.find({ hasVariants: true });
    
    for (const product of products) {
      const actualSum = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      
      if (product.stock !== actualSum) {
        // Syncing the parent stock to match variant sum
        product.stock = actualSum;
        await product.save(); 
        console.log(`[Auto-Heal] Fixed drift for: ${product.name}`);
      }
    }
  } catch (error) {
    console.error("Silent Heal failed:", error.message);
  }
}
export async function saveProduct(prevState, formData) {
  try {
    await mongodb();

    const rawId = formData.get("id");
    const id = rawId && rawId !== "undefined" && rawId !== "" ? rawId : null;
    const hasVariants = formData.get("hasVariants") === "true";

    // 1. Image Handling (Keep your existing logic)
    let imageUrl = formData.get("existingImage") || "";
    const mainImageFile = formData.get("imageFile");
    if (mainImageFile && mainImageFile instanceof File && mainImageFile.size > 0) {
      const uploadedUrl = await uploadToCloudinary(mainImageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // 2. Base Product Data
    let productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      subCategory: formData.get("subCategory"),
      isNewArrival: formData.get("isNewArrival") === "true",
      isArchived: formData.get("isArchived") === "true",
      hasVariants: hasVariants,
      imageUrl: imageUrl,
    };

    // 3. Variant & SKU Processing
    if (hasVariants) {
      const rawVariants = JSON.parse(formData.get("variantsJson") || "[]");
      
      // 🟢 THE FIX: Manually track total stock for the parent product
      let totalCalculatedStock = 0;

      const processedVariants = await Promise.all(
        rawVariants.map(async (v, index) => {
          let vImageUrl = v.imageUrl || "";
          const variantFile = formData.get(`variantImage_${index}`);

          if (variantFile && variantFile instanceof File && variantFile.size > 0) {
            const uploadedVUrl = await uploadToCloudinary(variantFile);
            if (uploadedVUrl) vImageUrl = uploadedVUrl;
          }

          const vStock = Number(v.stock) || 0;
          totalCalculatedStock += vStock; // Summing up

          return {
            ...v,
            sku: v.sku || "",
            price: Number(v.price) || 0,
            stock: vStock,
            minOrderQuantity: Number(v.minOrderQuantity) || 1,
            imageUrl: vImageUrl,
          };
        }),
      );

      productData.variants = processedVariants;
      productData.stock = totalCalculatedStock; // 🟢 Set the parent total here

      const validPrices = processedVariants.map((v) => v.price).filter((p) => p > 0);
      productData.price = validPrices.length > 0 ? Math.min(...validPrices) : 0;
      productData.minOrderQuantity = processedVariants[0]?.minOrderQuantity || 1;
      productData.sku = processedVariants[0]?.sku || formData.get("sku") || "";
    } else {
      productData.price = Number(formData.get("price")) || 0;
      productData.stock = Number(formData.get("stock")) || 0;
      productData.minOrderQuantity = Number(formData.get("minOrderQuantity")) || 1;
      productData.sku = formData.get("sku") || "";
      productData.variants = [];
    }

    // 4. Save Logic
    if (id) {
      const product = await Product.findById(id);
      if (!product) throw new Error("Product not found");

      Object.assign(product, productData);
      // Middleware in Product.js now only handles SKU generation, not stock math.
      await product.save(); 
    } else {
      const newProduct = new Product(productData);
      await newProduct.save();
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, message: "Product saved successfully!" };
  } catch (error) {
    console.error("Save Error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
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
      { new: true },
    );
    if (!updatedProduct)
      return { success: false, message: "Product not found" };

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

    // 1. Find the product
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    // 2. Helper to extract Public ID
    const extractPublicId = (url) => {
      if (!url || !url.includes("cloudinary")) return null;
      try {
        const parts = url.split("/");
        const fileName = parts.pop(); // image.jpg
        const folder = parts.pop(); // ecom-products
        return `${folder}/${fileName.split(".")[0]}`;
      } catch (e) {
        return null;
      }
    };

    // 3. Delete Main Image from Cloudinary
    const mainPublicId = extractPublicId(product.imageUrl);
    if (mainPublicId) {
      await cloudinary.uploader.destroy(mainPublicId);
    }

    // 4. Delete Variant Images from Cloudinary
    if (product.hasVariants && product.variants?.length > 0) {
      await Promise.all(
        product.variants.map(async (variant) => {
          const vPublicId = extractPublicId(variant.imageUrl);
          if (vPublicId) {
            return cloudinary.uploader.destroy(vPublicId);
          }
        }),
      );
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
    return {
      success: false,
      message: error.message || "Failed to delete product",
    };
  }
}

export async function reduceProductStock(
  productId,
  variantId = null,
  quantity = 1,
) {
  try {
    await mongodb();
    if (variantId) {
      // For Variant Products: Use positional operator $ to update the specific variant stock
      await Product.updateOne(
        { _id: productId, "variants._id": variantId },
        {
          $inc: {
            "variants.$.stock": -quantity,
            stock: -quantity,
          },
        },
      );
    } else {
      // For Standard Products
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }
  } catch (error) {
    console.error("STOCKS_UPDATE_ERROR:", error);
    throw new Error("Failed to update stock");
  }
}
