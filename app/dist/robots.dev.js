"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = robots;

function robots() {
  var baseUrl = "http://localhost:3000/";
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/payment", // Matches your folder structure
      "/success", "/checkout"]
    }],
    sitemap: "".concat(baseUrl, "/sitemap.xml")
  };
}