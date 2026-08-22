"use server";

import { revalidatePath } from "next/cache";
import mongodb from "@/lib/mongodb";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { CATEGORY_DNA } from "@/lib/categoryDNA"; // 🧬 Updated to your new DNA file
import { createInAppNotification } from "@/actions/inAppNotifications";
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// async function uploadToCloudinary(file) {
//   if (!file || file.size === 0 || typeof file === "string") return null;
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder: "ecom-products" }, (error, result) => {
//         if (error) reject(error);
//         else resolve(result.secure_url);
//       })
//       .end(buffer);
//   });
// }

export async function uploadToCloudinary(file) {
  if (!file || file.size === 0 || typeof file === "string") {
    console.log("☁️ Cloudinary: Skip upload (Invalid file or already a URL)");
    return typeof file === "string" ? file : null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ecom-products" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary Success:", result.secure_url);
            resolve(result.secure_url);
          }
        },
      );
      uploadStream.end(buffer);
    });
  } catch (err) {
    console.error("❌ Buffer Conversion Error:", err);
    return null;
  }
}

export async function silentInventoryHeal() {
  try {
    await mongodb();
    const products = await Product.find({ hasVariants: true });
    for (const product of products) {
      const actualSum = product.variants.reduce(
        (acc, v) => acc + (Number(v.stock) || 0),
        0,
      );
      if (product.stock !== actualSum) {
        product.stock = actualSum;
        await product.save();
      }
    }
  } catch (error) {
    console.error("Silent Heal failed:", error.message);
  }
}

export async function saveProduct(prevState, formData) {
  try {
    await mongodb();
    const id = formData.get("id");
    const hasVariants = formData.get("hasVariants") === "true";

    // --- 1. HANDLE MAIN IMAGE (Synchronized with Frontend) ---
    let imageUrl = formData.get("imageUrl") || ""; // Default to existing URL string
    const mainImageFile = formData.get("mainImage");

    if (
      mainImageFile &&
      mainImageFile instanceof File &&
      mainImageFile.size > 0
    ) {
      const uploadedUrl = await uploadToCloudinary(mainImageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // --- 2. HANDLE DETAIL GALLERY ---
    const rawExistingGallery = JSON.parse(
      formData.get("existingGallery") || "[]",
    );
    const existingGalleryUrls = rawExistingGallery
      .map((item) => (typeof item === "string" ? item : item.url || ""))
      .filter((url) => url !== "");

    const newGalleryUploads = [];
    for (const [key, value] of formData.entries()) {
      if (
        key.startsWith("galleryFile_") &&
        value instanceof File &&
        value.size > 0
      ) {
        const uploadedUrl = await uploadToCloudinary(value);
        if (uploadedUrl) newGalleryUploads.push(uploadedUrl);
      }
    }
    const finalGallery = [...existingGalleryUrls, ...newGalleryUploads];

    // --- 3. DNA & LOGIC ---
    const categoryId = formData.get("categoryId");
    const subCategoryId = formData.get("subCategoryId");
    const mainCat = CATEGORY_DNA.find(
      (c) => String(c._id) === String(categoryId),
    );
    const subCat = CATEGORY_DNA.find(
      (c) => String(c._id) === String(subCategoryId),
    );

    const isOnSale = formData.get("isOnSale") === "true";
    const discountPrice = Number(formData.get("discountPrice")) || 0;
    const pricingTiers = JSON.parse(formData.get("pricingTiers") || "[]");

    let productData = {
      name: formData.get("name")?.trim(),
      description: formData.get("description"),
      category: categoryId || null,
      subCategory: subCategoryId || null,
      categoryName: mainCat ? mainCat.name : "Uncategorized",
      subCategoryName: subCat ? subCat.name : "",
      isNewArrival: formData.get("isNewArrival") === "true",
      hasVariants: hasVariants,
      imageUrl: imageUrl,
      gallery: finalGallery,
      price: Number(formData.get("price")) || 0,
      stock: Number(formData.get("stock")) || 0,
      minOrderQuantity: Number(formData.get("minOrderQuantity")) || 1,
      isOnSale: isOnSale,
      discountPrice: discountPrice,
      pricingTiers: pricingTiers,
    };

    // --- 4. HANDLE VARIANTS ---
    if (hasVariants) {
      const rawVariants = JSON.parse(formData.get("variantsJson") || "[]");
      productData.variants = await Promise.all(
        rawVariants.map(async (v, i) => {
          let vImg = v.imageUrl || "";
          const vFile = formData.get(`variantFile_${i}`);
          if (vFile && vFile instanceof File && vFile.size > 0) {
            const uploadedVImg = await uploadToCloudinary(vFile);
            if (uploadedVImg) vImg = uploadedVImg;
          }
          return {
            sku: v.sku || "",
            size: v.size,
            color: v.color,
            imageUrl: vImg,
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            minOrderQuantity: Number(v.minOrderQuantity) || 1,
          };
        }),
      );

      productData.stock = productData.variants.reduce(
        (acc, v) => acc + (v.stock || 0),
        0,
      );
      const variantPrices = productData.variants
        .map((v) => v.price)
        .filter((p) => p > 0);
      if (variantPrices.length > 0) {
        productData.price = Math.min(...variantPrices);
      }
    }

    // --- 5. DATABASE OPERATION ---
    let finalProduct;
    const isValidId = id && id !== "null" && id !== "" && id !== "undefined";

    if (isValidId) {
      finalProduct = await Product.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true, runValidators: true, strict: false },
      );
    } else {
      finalProduct = await Product.create(productData);

      // --- 🟢 TRIGGER IN-APP NOTIFICATION FOR NEW ARRIVAL ---
      try {
        await createInAppNotification({
          title: "New Arrival Added! 🔥",
          message: `Check out our new item: ${finalProduct.name}`,
          type: "arrival", // 🟢 Matches your NotificationSchema enum
          recipientId: "GLOBAL",
          link: `/product/${finalProduct._id}`,
        });
      } catch (notifErr) {
        console.error("Failed to send new product notification:", notifErr);
      }
    }

    // --- 6. REVALIDATION ---
    const paths = ["/admin/products", "/products", "/", "/new-arrivals"];
    paths.forEach((p) => revalidatePath(p));
    if (finalProduct?._id) revalidatePath(`/product/${finalProduct._id}`);

    return {
      success: true,
      message: "Treasure Saved! ✨",
      data: JSON.parse(JSON.stringify(finalProduct)),
    };
  } catch (error) {
    console.error("Save Error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
}

export async function toggleArchiveProduct(productId) {
  try {
    await mongodb();
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };
    product.isArchived = !product.isArchived;
    await product.save();
    revalidatePath("/admin/products");
    return { success: true, newState: product.isArchived };
  } catch (error) {
    return { success: false, message: "Archive toggle failed" };
  }
}

export async function removeFromNewArrivals(productId) {
  try {
    await mongodb();
    await Product.findByIdAndUpdate(productId, { isNewArrival: false });
    revalidatePath("/admin/new-arrivals");
    revalidatePath("/admin/products");
    return { success: true, message: "Removed from New Arrivals" };
  } catch (error) {
    return { success: false, message: "Removal failed" };
  }
}

export async function deleteProduct(productId) {
  try {
    await mongodb();
    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found" };

    // 1. Delete Main Image
    const mainPublicId = extractPublicId(product.imageUrl);
    if (mainPublicId) await cloudinary.uploader.destroy(mainPublicId);

    // 2. Delete Gallery Images
    if (product.gallery && product.gallery.length > 0) {
      await Promise.all(
        product.gallery.map((url) => {
          const gPid = extractPublicId(url);
          return gPid ? cloudinary.uploader.destroy(gPid) : null;
        }),
      );
    }

    // 3. Delete Variant Images
    if (product.hasVariants && product.variants?.length > 0) {
      await Promise.all(
        product.variants.map((v) => {
          const vPid = extractPublicId(v.imageUrl);
          return vPid ? cloudinary.uploader.destroy(vPid) : null;
        }),
      );
    }

    await Product.findByIdAndDelete(productId);
    revalidatePath("/admin/products");

    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
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
      await Product.updateOne(
        { _id: productId, "variants._id": variantId },
        { $inc: { "variants.$.stock": -quantity, stock: -quantity } },
      );
    } else {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }
    revalidatePath("/admin/products");
  } catch (error) {
    throw new Error("Stock update failed");
  }
}

export async function getProducts() {
  try {
    await mongodb();
    // Fetch all products without .limit() and convert Mongoose document to plain JS object
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
