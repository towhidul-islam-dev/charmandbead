"use server";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getDynamicCategoryStructure() {
  await dbConnect();
  const allCategories = await Category.find().lean();

  const structure = {};

  // 1. Find all parent categories (those with no parentId)
  const parents = allCategories.filter(cat => !cat.parentId);

  // 2. Map their children
  parents.forEach(parent => {
    structure[parent.name] = allCategories
      .filter(child => String(child.parentId) === String(parent._id))
      .map(child => child.name);
  });

  return structure;
}

export async function deleteCategoryAction(id) {
  try {
    await dbConnect();

    // 1. Check if it has sub-categories
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return { success: false, message: "Cannot delete. This category has sub-categories." };
    }

    // 2. Check if products are still assigned to it
    const hasProducts = await Product.findOne({ 
      $or: [{ category: id }, { subCategory: id }] 
    });
    if (hasProducts) {
      return { success: false, message: "Cannot delete. Products are still assigned to this category." };
    }

    await Category.findByIdAndDelete(id);
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Delete failed." };
  }
}