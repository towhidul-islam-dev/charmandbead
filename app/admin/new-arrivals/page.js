import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { removeFromNewArrivals } from "@/actions/product";
import Image from "next/image";
import {
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function AdminNewArrivals() {
  await dbConnect();

  // Fetch only products flagged as New Arrivals
  const products = await Product.find({ isNewArrival: true }).sort({
    updatedAt: -1,
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Manage New Arrivals
            </h1>
            <p className="text-sm text-gray-500">
              Products currently featured in the "New Arrivals" collection.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add More
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    No products are currently marked as New Arrivals.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-100">
                          <img
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </Link>

                        {/* 💡 Use .bind to pass the product ID to the Server Action */}
                        <form
                          action={removeFromNewArrivals.bind(
                            null,
                            product._id.toString()
                          )}
                        >
                          <button
                            type="submit"
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove from New Arrivals"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Tip: De-listing a product only removes it from the "New Arrivals"
            section; it will remain in your main inventory.
          </p>
        </div>
      </div>
    </div>
  );
}
