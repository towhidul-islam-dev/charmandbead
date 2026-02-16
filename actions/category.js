"use server";

import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

/**
 * Saves a new category.
 * Fixed: Explicitly handles parentId conversion to ObjectId or null.
 */
export async function saveCategoryAction(formData) {
  try {
    await dbConnect();
    
    const name = formData.get("name")?.trim();
    const parentId = formData.get("parentId");

    if (!name) return { success: false, error: "Category name is required" };

    // 🟢 CRITICAL FIX: Ensure the ID is a valid Mongoose ObjectId or strictly null
    let finalParentId = null;
    if (parentId && parentId !== "" && parentId !== "none" && parentId !== "null") {
      finalParentId = new mongoose.Types.ObjectId(parentId);
    }

    const newCategory = await Category.create({
      name,
      parentId: finalParentId,
    });

    console.log("✅ Category Created:", newCategory.name);

    revalidatePath("/admin/categories");
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newCategory)) 
    };
    
  } catch (error) {
    console.error("❌ DATABASE SAVE ERROR:", error.message);
    // If error.code is 11000, it's a duplicate slug error
    const errorMsg = error.code === 11000 
      ? "A category with this name already exists (Duplicate Slug)." 
      : error.message;
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetches all categories with product counts for the Stat Cards.
 */
export async function getCategories() {
  try {
    await dbConnect();
    
    // 1. Fetch Categories and Products
    const [categories, products] = await Promise.all([
      Category.find().lean(),
      Product.find({}, 'category subCategory').lean()
    ]);
    
    // 2. Map and Calculate counts
    return categories.map(cat => {
      const catId = cat._id.toString();
      
      // Count how many products belong to this category or subcategory
      const productCount = products.filter(p => 
        p.category?.toString() === catId || p.subCategory?.toString() === catId
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
    return { success: false, message: "Sync Error: Could not remove category." };
  }
}

/**
 * Legacy fetcher for older components (keeping for compatibility)
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