"use client";

import { useTransition } from 'react';
import { deleteProduct } from '@/actions/delete'; 
import { Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeleteButton({ productId, productName, onDelete }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteProduct(productId);
                
                if (result.success) {
                    // 🟢 This is the critical fix: Update local UI state
                    if (onDelete) onDelete(productId);
                    toast.success(`${productName} deleted`);
                } else {
                    toast.error(`Deletion failed: ${result.message}`);
                }
            } catch (error) {
                toast.error("An error occurred during deletion");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-gray-400 transition-all bg-gray-100 rounded-xl hover:bg-red-500 hover:text-white disabled:opacity-50"
        >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
        </button>
    );
}