// app/admin/products/page.js - Final Module Export Fix

// 1. Define the component as a regular function
function ProductsPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold">Products Management</h1>
            <p className="mt-2">List of all products and links to add/edit products.</p>
        </div>
    );
} 

// 2. Assign the default export explicitly (non-async for maximum compatibility)
const ProductsPageExport = ProductsPage;

export default ProductsPageExport;