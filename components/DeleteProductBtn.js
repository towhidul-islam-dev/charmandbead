"use client";

import { useState } from "react";
import { deleteProduct } from "@/actions/product";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteProductBtn({ productId }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("ARE YOU ABSOLUTELY SURE? This will delete the product and all associated images from Cloudinary permanently.")) {
      return;
    }

    setIsPending(true);
    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(res.message || "Failed to delete product");
      }
    } catch (error) {
      alert("An error occurred while deleting.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all bg-red-600 shadow-lg hover:bg-red-700 rounded-xl active:scale-95 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Delete Product
        </>
      )}
    </button>
  );
}