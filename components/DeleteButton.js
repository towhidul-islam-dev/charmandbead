// components/DeleteButton.jsx (Client Component)
"use client";

import { useTransition } from 'react';
import { deleteProduct } from '@/actions/delete'; 

// 🚨 Ensure this component uses 'export default' 🚨
export default function DeleteButton({ productId, productName }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!window.confirm(`Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`)) {
            return;
        }

        startTransition(async () => {
            const result = await deleteProduct(productId);
            
            if (result.success) {
                console.log(result.message);
            } else {
                alert(`Deletion failed: ${result.message}`);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="ml-4 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? 'Deleting...' : 'Delete'}
        </button>
    );
}