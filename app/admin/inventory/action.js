"use server";
import dbConnect from "@/lib/mongodb";
import InventoryLog from "@/models/InventoryLog";
import { revalidatePath } from "next/cache";

export async function cleanupDuplicateLogs() {
  try {
    await dbConnect();

    // 1. Grouping logs by Order ID, SKU, and the exact Minute
    const duplicates = await InventoryLog.aggregate([
      {
        $group: {
          _id: { 
            reason: "$reason", 
            sku: "$sku",
            // Groups items created in the same minute to catch the glitch
            time: { $dateToString: { format: "%Y-%m-%d-%H-%M", date: "$createdAt" } }
          },
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          totalMistakenDeduction: { $sum: "$change" } 
        }
      },
      { $match: { count: { $gt: 1 } } } 
    ]);

    let deletedCount = 0;

    for (const group of duplicates) {
      // Keep only the first entry, remove the rest
      const idsToDelete = group.ids.slice(1); 
      const result = await InventoryLog.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount += result.deletedCount;
    }

    revalidatePath("/admin/inventory");
    return { 
      success: true, 
      message: `Successfully removed ${deletedCount} duplicate entries from history.` 
    };
  } catch (error) {
    console.error("CLEANUP_ERROR:", error);
    return { success: false, message: error.message };
  }
}