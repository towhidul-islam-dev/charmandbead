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
    
    const name = formData.get("name")?.trim();
    const parentId = formData.get("parentId");
    const imageUrl = formData.get("imageUrl"); 

    if (!name) return { success: false, error: "Category name is required" };

    let finalParentId = null;
    // Improved check for various "empty" states
    if (parentId && !["", "none", "null", "undefined"].includes(String(parentId))) {
      finalParentId = new mongoose.Types.ObjectId(String(parentId));
    }

    const newCategory = await Category.create({
      name,
      parentId: finalParentId,
      image: imageUrl || "",
    });

    revalidatePath("/admin/categories");
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newCategory)) 
    };
    
  } catch (error) {
    console.error("❌ DATABASE SAVE ERROR:", error.message);
    const errorMsg = error.code === 11000 
      ? "A category with this name already exists (Duplicate Slug)." 
      : error.message;
    return { success: false, error: errorMsg };
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