"use server";
import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

/**
 * Fetches both the nested structure and the flat array of categories.
 * Useful for both the Product Form dropdowns and the Category Manager.
 */
export async function getDynamicCategoryStructure() {
  await dbConnect();
  
  // Fetch all categories and convert to plain objects
  const allCategories = await Category.find().lean();
  const serializedCategories = JSON.parse(JSON.stringify(allCategories));

  const structure = {};

  // 1. Find all parent categories (those with no parentId)
  const parents = serializedCategories.filter(cat => !cat.parentId);

  // 2. Map their children
  parents.forEach(parent => {
    structure[parent.name] = serializedCategories
      .filter(child => String(child.parentId) === String(parent._id))
      .map(child => child.name);
  });

  return {
    structure, // e.g., { "Beads": ["Crystal", "Glass"], "Charms": [...] }
    raw: serializedCategories // Full flat list for the CategoryManager modal
  };
}

export async function deleteCategoryAction(id) {
  try {
    await dbConnect();

    // 1. Check if it has sub-categories
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return { 
        success: false, 
        message: "Hierarchy Protection: This category has sub-categories that must be removed first." 
      };
    }

    // 2. Check if products are still assigned to it
    const hasProducts = await Product.findOne({ 
      $or: [{ category: id }, { subCategory: id }] 
    });
    if (hasProducts) {
      return { 
        success: false, 
        message: "Inventory Protection: Products are still assigned to this category." 
      };
    }

    await Category.findByIdAndDelete(id);
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Sync Error: Could not delete category." };
  }
}

/**
 * New helper to save/update categories
 */
export async function saveCategoryAction(formData) {
  try {
    await dbConnect();
    const name = formData.get("name");
    const parentId = formData.get("parentId") || null;

    if (!name) return { success: false, message: "Name is required" };

    const newCategory = await Category.create({ name, parentId });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/create"); // Revalidate where the dropdowns live
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newCategory)) 
    };
  } catch (error) {
    return { success: false, message: "Failed to create category" };
  }
}