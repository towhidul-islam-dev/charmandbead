"use server";
import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

/**
 * Fetches both the nested structure and the flat array of categories.
 */
export async function getDynamicCategoryStructure() {
  try {
    await dbConnect();
    
    // Fetch all categories and convert to plain objects
    const allCategories = await Category.find().lean();
    const serializedCategories = JSON.parse(JSON.stringify(allCategories));

    const structure = {};

    // 1. Find all parent categories
    // 🟢 FIXED: Check for null, undefined, or empty string to be safe
    const parents = serializedCategories.filter(cat => !cat.parentId || cat.parentId === "" || cat.parentId === null);

    // 2. Map their children
    parents.forEach(parent => {
      structure[parent.name] = serializedCategories
        .filter(child => child.parentId && String(child.parentId) === String(parent._id))
        .map(child => child.name);
    });

    return {
      structure,
      raw: serializedCategories // Full flat list for the CategoryManager modal
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { structure: {}, raw: [] };
  }
}

export async function deleteCategoryAction(id) {
  try {
    await dbConnect();

    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return { 
        success: false, 
        message: "Hierarchy Protection: This category has sub-categories." 
      };
    }

    // 🟢 NOTE: Since Product stores category names (strings) usually, 
    // ensure this query matches your Product schema field types
    const hasProducts = await Product.findOne({ 
      $or: [{ category: id }, { subCategory: id }] 
    });
    
    if (hasProducts) {
      return { 
        success: false, 
        message: "Inventory Protection: Products are still assigned here." 
      };
    }

    await Category.findByIdAndDelete(id);
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Sync Error: Could not delete category." };
  }
}

// actions/category.js
// actions/category.js
export async function saveCategoryAction(formData) {
  try {
    await dbConnect();
    
    const name = formData.get("name")?.trim();
    let parentId = formData.get("parentId");

    // 🟢 Ensure parentId is strictly null if not a valid ID
    const finalParentId = (parentId && parentId !== "none" && parentId !== "") 
      ? parentId 
      : null;

    if (!name) throw new Error("Name is missing from form data");

    console.log("Attempting to save:", { name, finalParentId });

    const newCategory = await Category.create({
      name,
      parentId: finalParentId,
    });

    console.log("Save successful:", newCategory._id);

    revalidatePath("/admin/categories");
    return { success: true, data: JSON.parse(JSON.stringify(newCategory)) };
    
  } catch (error) {
    // 🟢 This will show the EXACT Mongoose error in your terminal
    console.error("DATABASE SAVE ERROR:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getCategories() {
  try {
    await dbConnect();
    const categories = await Category.find().lean();
    
    // We transform the data so it doesn't break the "Client Component" serialization
    return categories.map(cat => ({
      ...cat,
      _id: cat._id.toString(),
      parentId: cat.parentId ? cat.parentId.toString() : null, // 🟢 Handle the ObjectId
      createdAt: cat.createdAt?.toISOString(),
      updatedAt: cat.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}