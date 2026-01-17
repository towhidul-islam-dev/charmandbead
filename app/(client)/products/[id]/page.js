import { getProductById, getRelatedProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductDetailsContent from "./productDetailsContent";

// 🟢 DYNAMIC SEO: This function creates unique tags for every product
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { product, success } = await getProductById(id);

  if (!success || !product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name, // This works with your layout template: "Product Name | Charm & Bead"
    description: product.description?.substring(0, 160), 
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.imageUrl, // Social media will show the actual product image
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetails({ params }) {
  const { id } = await params;
  const { product, success } = await getProductById(id);

  if (!success || !product)
    return <div className="py-20 font-black text-center text-gray-400">Product not found.</div>;

  const { products: relatedItems } = await getRelatedProducts(product.category, id);

  return (
    <div className="bg-[#F3F4F6]/50 min-h-screen pb-20">
      <div className="px-4 py-10 mx-auto max-w-7xl lg:py-16">
        <ProductDetailsContent product={product} />

        {relatedItems?.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-10 text-2xl italic font-black tracking-tight text-gray-800 uppercase">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {relatedItems.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}