import { getProducts } from "@/lib/data";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const { products, success, error } = await getProducts();

  if (!success) {
    return (
      <div className="p-4 text-red-500 md:p-8">
        Error loading products: {error}
      </div>
    );
  }

  // CONVERT DATA TO PLAIN OBJECTS HERE
  // This removes the "toJSON methods" and "buffer" error by 
  // turning the MongoDB objects into simple strings/objects.
  const serializedProducts = JSON.parse(JSON.stringify(products));

  // Pass the cleaned data to the Client Component
  return <AdminProductsClient initialProducts={serializedProducts} />;
}