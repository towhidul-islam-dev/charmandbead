// app/admin/products/page.js
export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 

import { getProducts } from "@/lib/data";
import AdminProductsClient from "./AdminProductsClient";
import { silentInventoryHeal } from "@/actions/product"; // 🟢 Import the healer

export default async function AdminProductsPage() {
  
  await silentInventoryHeal();

  // 2. Fetch the "clean" products
  const { products, success, error } = await getProducts(true);

  if (!success) {
    return (
      <div className="p-4 md:p-8 font-bold text-[#EA638C]">
        Error loading products: {error}
      </div>
    );
  }

  const serializedProducts = JSON.parse(JSON.stringify(products));

  return <AdminProductsClient initialProducts={serializedProducts} />;
}