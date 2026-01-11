// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - The image file buffer.
 * @param {string} folder - The destination folder in Cloudinary (e.g., 'ecom-products').
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadImage(buffer, folder = 'ecom-products') {
  return new Promise((resolve, reject) => {
    // Convert Buffer to base64 Data URI for upload
    const dataURI = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    cloudinary.uploader.upload(dataURI, {
      folder: folder,
      transformation: [
        { width: 800, crop: "limit" } // Example transformation
      ]
    }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });
  });
}