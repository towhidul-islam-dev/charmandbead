"use server";

import { revalidatePath } from "next/cache";
import mongodb from "@/lib/mongodb";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { CATEGORY_DNA } from "@/lib/categoryDNA";
import { createInAppNotification } from "@/actions/inAppNotifications";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 string or file buffer to Cloudinary
 */
export async function uploadToCloudinary(fileOrBase64) {
  if (!fileOrBase64) return null;

  // If it's already a hosted Cloudinary/HTTP URL, don't re-upload
  if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("http")) {
    return fileOrBase64;
  }

  try {
    // Handle Base64 strings sent from client compressor
    if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(fileOrBase64, {
        folder: "ecom-products",
      });
      return result.secure_url;
    }

    // Handle standard File objects
    if (fileOrBase64 instanceof File && fileOrBase64.size > 0) {
      const arrayBuffer = await fileOrBase64.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "ecom-products" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary Upload Error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(buffer);
      });
    }

    return null;
  } catch (err) {
    console.error("❌ Cloudinary Upload Exception:", err);
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
        0
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

    const rawPayload = formData.get("payload");
    let payload = {};

    if (rawPayload) {
      payload = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;
    }

    const getVal = (key) => payload[key] ?? formData.get(key);

    const id = getVal("id");
    const hasVariants = getVal("hasVariants") === true || getVal("hasVariants") === "true";

    // --- 1. HANDLE MAIN IMAGE ---
    let imageUrl = 
      payload.imageUrl || 
      payload.mainImage || 
      formData.get("existingMainImageUrl") || 
      formData.get("imageUrl") || 
      "";

    const mainImageFile = formData.get("mainImageFile") || formData.get("mainImage");

    if (mainImageFile && mainImageFile instanceof File && mainImageFile.size > 0) {
      const uploadedUrl = await uploadToCloudinary(mainImageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    } else if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("data:image")) {
      const uploadedUrl = await uploadToCloudinary(imageUrl);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // --- 2. HANDLE DETAIL GALLERY ---
    let finalGallery = [];

    if (Array.isArray(payload.gallery)) {
      finalGallery = await Promise.all(
        payload.gallery.map(async (item) => {
          const itemUrl = typeof item === "string" ? item : item.url || "";
          if (itemUrl.startsWith("data:image")) {
            const uploaded = await uploadToCloudinary(itemUrl);
            return uploaded || "";
          }
          return itemUrl;
        })
      );
      finalGallery = finalGallery.filter(Boolean);
    } else {
      // Handle both Form Data approaches (batch arrays or key indexing)
      const existingGalleryUrls = formData.getAll("existingGalleryUrls");
      const rawExistingGallery = existingGalleryUrls.length > 0
        ? existingGalleryUrls
        : JSON.parse(formData.get("existingGallery") || formData.get("gallery") || "[]");

      const processedExisting = await Promise.all(
        rawExistingGallery
          .map((item) => (typeof item === "string" ? item : item.url || ""))
          .filter(Boolean)
          .map(async (url) => {
            if (url.startsWith("data:image")) {
              const uploaded = await uploadToCloudinary(url);
              return uploaded || "";
            }
            return url;
          })
      );

      const newGalleryUploads = [];
      const galleryFiles = formData.getAll("galleryFiles");

      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          if (file instanceof File && file.size > 0) {
            const uploadedUrl = await uploadToCloudinary(file);
            if (uploadedUrl) newGalleryUploads.push(uploadedUrl);
          }
        }
      } else {
        for (const [key, value] of formData.entries()) {
          if (key.startsWith("galleryFile_") && value instanceof File && value.size > 0) {
            const uploadedUrl = await uploadToCloudinary(value);
            if (uploadedUrl) newGalleryUploads.push(uploadedUrl);
          }
        }
      }

      finalGallery = [...processedExisting.filter(Boolean), ...newGalleryUploads];
    }

    // --- 3. DNA & LOGIC ---
    const categoryId = getVal("categoryId") || getVal("category");
    const subCategoryId = getVal("subCategoryId") || getVal("subCategory");

    const mainCat = CATEGORY_DNA.find((c) => String(c._id) === String(categoryId));
    const subCat = CATEGORY_DNA.find((c) => String(c._id) === String(subCategoryId));

    const isOnSale = getVal("isOnSale") === true || getVal("isOnSale") === "true";
    const discountPrice = Number(getVal("discountPrice")) || 0;
    const rawPricingTiers = payload.pricingTiers || JSON.parse(formData.get("pricingTiers") || "[]");

    let productData = {
      name: String(getVal("name") || "").trim(),
      description: getVal("description") || "",
      category: categoryId || null,
      subCategory: subCategoryId || null,
      categoryName: mainCat ? mainCat.name : (getVal("categoryName") || "Uncategorized"),
      subCategoryName: subCat ? subCat.name : (getVal("subCategoryName") || ""),
      isNewArrival: getVal("isNewArrival") === true || getVal("isNewArrival") === "true",
      hasVariants: hasVariants,
      imageUrl: imageUrl || "",
      gallery: finalGallery,
      price: Number(getVal("price")) || 0,
      stock: Number(getVal("stock")) || 0,
      minOrderQuantity: Number(getVal("minOrderQuantity")) || 1,
      isOnSale: isOnSale,
      discountPrice: discountPrice,
      pricingTiers: rawPricingTiers,
    };

    // Add root-level SKU only when variants are not used
    if (!hasVariants) {
      productData.sku = String(getVal("sku") || "").trim();
    } else {
      productData.sku = undefined; // Prevent orphan root SKU when variants are enabled
    }

    // --- 4. HANDLE VARIANTS ---
    if (hasVariants) {
      const rawVariants = 
        payload.variants || 
        JSON.parse(formData.get("variantData") || formData.get("variantsJson") || formData.get("variants") || "[]");

      productData.variants = await Promise.all(
        rawVariants.map(async (v, i) => {
          let vImg = v.imageUrl || "";
          const vFile = formData.get(`variantFile_${i}`);

          if (vFile && vFile instanceof File && vFile.size > 0) {
            const uploadedVImg = await uploadToCloudinary(vFile);
            if (uploadedVImg) vImg = uploadedVImg;
          } else if (vImg && typeof vImg === "string" && vImg.startsWith("data:image")) {
            const uploadedVImg = await uploadToCloudinary(vImg);
            if (uploadedVImg) vImg = uploadedVImg;
          }

          return {
            sku: v.sku || "",
            size: v.size || "",
            color: v.color || "",
            imageUrl: vImg || "",
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            minOrderQuantity: Number(v.minOrderQuantity) || 1,
          };
        })
      );

      // Recalculate stock and price fallbacks
      productData.stock = productData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

      const variantPrices = productData.variants
        .map((v) => v.price)
        .filter((p) => p > 0);

      if (variantPrices.length > 0) {
        productData.price = Math.min(...variantPrices);
      }
    } else {
      productData.variants = [];
    }

    // --- 5. DATABASE OPERATION ---
    let finalProduct;
    const isValidId = id && id !== "null" && id !== "" && id !== "undefined";

    if (isValidId) {
      // Explicitly unset root `sku` if converting product to use variants
      const updateQuery = hasVariants 
        ? { $set: productData, $unset: { sku: "" } } 
        : { $set: productData };

      finalProduct = await Product.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, runValidators: true, strict: false }
      );
    } else {
      finalProduct = await Product.create(productData);

      if (productData.isNewArrival) {
        try {
          await createInAppNotification({
            title: "New Arrival Added! 🔥",
            message: `Check out our new item: ${finalProduct.name}`,
            type: "arrival",
            recipientId: "GLOBAL",
            link: `/product/${finalProduct._id}`,
          });
        } catch (notifErr) {
          console.error("Failed to send new product notification:", notifErr);
        }
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

    const extractPublicId = (url) => {
      if (!url || typeof url !== "string") return null;
      const parts = url.split("/");
      const filename = parts.pop().split(".")[0];
      const folder = parts.pop();
      return `${folder}/${filename}`;
    };

    // 1. Delete Main Image
    const mainPublicId = extractPublicId(product.imageUrl);
    if (mainPublicId) await cloudinary.uploader.destroy(mainPublicId);

    // 2. Delete Gallery Images
    if (product.gallery && product.gallery.length > 0) {
      await Promise.all(
        product.gallery.map((url) => {
          const gPid = extractPublicId(url);
          return gPid ? cloudinary.uploader.destroy(gPid) : null;
        })
      );
    }

    // 3. Delete Variant Images
    if (product.hasVariants && product.variants?.length > 0) {
      await Promise.all(
        product.variants.map((v) => {
          const vPid = extractPublicId(v.imageUrl);
          return vPid ? cloudinary.uploader.destroy(vPid) : null;
        })
      );
    }

    await Product.findByIdAndDelete(productId);
    revalidatePath("/admin/products");

    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function reduceProductStock(productId, variantId = null, quantity = 1) {
  try {
    await mongodb();
    if (variantId) {
      await Product.updateOne(
        { _id: productId, "variants._id": variantId },
        { $inc: { "variants.$.stock": -quantity, stock: -quantity } }
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
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}