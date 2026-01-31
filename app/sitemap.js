import { getProducts } from "@/lib/data";

export default async function sitemap() {
  // 🟢 IMPORTANT: Use your actual live domain here for production
  const baseUrl = "https://your-charm-store-domain.com"; 

  try {
    // We destructure 'products' because your function returns { success, products }
    const { success, products } = await getProducts();
    
    if (!success || !products) {
      throw new Error("Failed to fetch products for sitemap");
    }

    const productEntries = products.map((product) => ({
      url: `${baseUrl}/product/${product._id}`,
      // Use the serialized createdAt date from your data.js
      lastModified: new Date(product.createdAt),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...productEntries,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to static pages so the site doesn't crash
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/shop`, lastModified: new Date() },
    ];
  }
}