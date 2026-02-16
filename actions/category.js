"use server";

import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { categories as staticCategories } from "@/lib/constants"; 

/**
 * 🟢 seedCategories
 * Syncs the static categories file with the Database.
 */
export async function seedCategories() {
  try {
    await dbConnect();

    for (const staticCat of staticCategories) {
      // 1. Upsert Parent Category
      const parent = await Category.findOneAndUpdate(
        { slug: staticCat.slug },
        { name: staticCat.name },
        { upsert: true, new: true }
      );

      // 🟢 Logic Update: Using lowercase 'subcategories' to match your constants.js
      if (staticCat.subcategories && Array.isArray(staticCat.subcategories)) {
        for (const sub of staticCat.subcategories) {
          await Category.findOneAndUpdate(
            { slug: sub.slug },
            { 
              name: sub.name, 
              parentId: parent._id 
            },
            { upsert: true }
          );
        }
      }
    }

    revalidatePath("/admin/categories");
    return { success: true, message: "Treasures synced with database! ✨" };
  } catch (error) {
    console.error("Seed Error:", error);
    return { success: false, error: "Sync failed." };
  }
}

/**
 * Saves a new category manually via UI.
 */
export async function saveCategoryAction(formData) {
  try {
    await dbConnect();
    
    // 1. Extract and sanitize inputs
    const name = formData.get("name")?.trim();
    const parentId = formData.get("parentId");
    const imageUrl = formData.get("imageUrl") || ""; 
    
    // 🟢 New Arrival & MOQ Logic
    const isNewArrival = formData.get("isNewArrival") === "true";
    const moq = parseInt(formData.get("moq")) || 1;

    if (!name) return { success: false, error: "Category name is required" };

    // 2. Prepare the data object
    const categoryData = {
      name,
      image: imageUrl,
      isNewArrival,
      moq,
      parentId: null
    };

    // 3. Handle Parent ID validation
    if (parentId && !["", "none", "null", "undefined"].includes(String(parentId))) {
      if (mongoose.Types.ObjectId.isValid(parentId)) {
        categoryData.parentId = new mongoose.Types.ObjectId(String(parentId));
      } else {
        console.warn("Invalid Parent ID format received:", parentId);
      }
    }

    // 4. Create the category
    // This triggers the pre('validate') middleware in your Category model
    const newCategory = await Category.create(categoryData);

    // 5. Sync the UI
    revalidatePath("/admin/categories");
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newCategory)) 
    };
    
  } catch (error) {
    console.error("❌ SERVER ERROR:", error); 
    
    // Handle Duplicate Slugs (MongoDB error code 11000)
    if (error.code === 11000) {
      return { 
        success: false, 
        error: "A category with this name (or slug) already exists." 
      };
    }
    
    // Handle Mongoose Validation Errors specifically
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return { success: false, error: messages.join(", ") };
    }
    
    return { success: false, error: error.message || "Internal Server Error" };
  }
}

/**
 * Fetches all categories with product counts.
 */
export async function getCategories() {
  try {
    await dbConnect();
    
    const [categories, products] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.find({}, 'category subCategory').lean()
    ]);
    
    return categories.map(cat => {
      const catId = cat._id.toString();
      
      // Count products that belong to this category OR sub-category
      const productCount = products.filter(p => 
        String(p.category) === catId || String(p.subCategory) === catId
      ).length;

      return {
        ...cat,
        _id: catId,
        parentId: cat.parentId ? cat.parentId.toString() : null,
        productCount: productCount,
        createdAt: cat.createdAt?.toISOString(),
        updatedAt: cat.updatedAt?.toISOString(),
      };
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

/**
 * Protects hierarchy and inventory before deleting.
 */
export async function deleteCategoryAction(id) {
  try {
    await dbConnect();

    // 1. Check for children
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return { success: false, message: "Protection: Please delete sub-categories first." };
    }

    // 2. Check for products
    const hasProducts = await Product.findOne({ 
      $or: [{ category: id }, { subCategory: id }] 
    });
    
    if (hasProducts) {
      return { success: false, message: "Protection: This category contains active products." };
    }

    await Category.findByIdAndDelete(id);
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Sync Error: Could not remove category." };
  }
}

/**
 * Legacy fetcher for older components
 */
export async function getDynamicCategoryStructure() {
  const categories = await getCategories();
  const structure = {};

  const parents = categories.filter(cat => !cat.parentId);

  parents.forEach(parent => {
    structure[parent.name] = categories
      .filter(child => child.parentId === parent._id)
      .map(child => child.name);
  });

  return { structure, raw: categories };
}