export default function robots() {
  const baseUrl = "http://localhost:3000/";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
       disallow: [
          "/admin", 
          "/api", 
          "/payment", // Matches your folder structure
          "/success", 
          "/checkout"
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}