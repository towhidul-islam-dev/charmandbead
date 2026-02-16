"use server";

import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { categories as staticCategories } from "@/lib/constants"; // 🟢 Import your static list

/**
 * 🟢 NEW: seedCategories
 * Syncs the static categories file with the Database.
 * This is the bridge we discussed to ensure SEO slugs match ObjectIDs.
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

      // 2. Process Subcategories
      if (staticCat.subcategories) {
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
 * Saves a new category.
 * Updated: Handles image fields if you decide to add icons to categories later.
 */
export async function saveCategoryAction(formData) {
  try {
    await dbConnect();
    
    const name = formData.get("name")?.trim();
    const parentId = formData.get("parentId");
    const imageUrl = formData.get("imageUrl"); // 🟢 Added image support

    if (!name) return { success: false, error: "Category name is required" };

    let finalParentId = null;
    if (parentId && parentId !== "" && parentId !== "none" && parentId !== "null") {
      finalParentId = new mongoose.Types.ObjectId(parentId);
    }

    // .create() will trigger the 'pre-save' hook in your model to generate the slug
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
 * Fetches all categories with product counts for the Stat Cards.
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

    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return { success: false, message: "Protection: Please delete sub-categories first." };
    }

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