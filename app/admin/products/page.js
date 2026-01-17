// app/admin/products/page.js
export const dynamic = 'force-dynamic'; // 🟢 Prevents static caching
export const revalidate = 0;           // 🟢 Ensures fresh data on every request

import { getProducts } from "@/lib/data";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  // We pass 'true' to get all products (including archived)
  const { products, success, error } = await getProducts(true);

  if (!success) {
    return (
      <div className="p-4 text-red-500 md:p-8">
        Error loading products: {error}
      </div>
    );
  }

  const serializedProducts = JSON.parse(JSON.stringify(products));

  return <AdminProductsClient initialProducts={serializedProducts} />;
}