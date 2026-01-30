"use server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function auditStockConsistency(fixIssues = false) {
  try {
    await dbConnect();
    // Only scan products that have variants since that's where the math errors occur
    const products = await Product.find({ hasVariants: true });
    
    let report = {
      scanned: products.length,
      issuesFound: 0,
      fixed: 0,
      details: []
    };

    for (const product of products) {
      // 1. Calculate the sum of all variant stocks
      const actualSum = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      const statedTotal = product.stock || 0;

      if (actualSum !== statedTotal) {
        report.issuesFound++;
        report.details.push({
          id: product._id,
          name: product.name,
          sku: product.sku || "No Main SKU",
          stated: statedTotal,
          actual: actualSum,
          diff: actualSum - statedTotal,
          variantCount: product.variants.length
        });

        if (fixIssues) {
          // 2. Sync using .save() instead of findByIdAndUpdate
          // This triggers your pre('save') hook which handles SKU generation and stock sync
          product.stock = actualSum; 
          await product.save(); 
          report.fixed++;
        }
      }
    }

    // Refresh the UI cache if we fixed anything
    if (report.fixed > 0) {
  revalidatePath("/admin/products");
  revalidatePath("/"); // If you show stock on the home page
}
    return { success: true, report };
  } catch (error) {
    console.error("AUDIT_ERROR:", error);
    return { success: false, message: error.message };
  }
}