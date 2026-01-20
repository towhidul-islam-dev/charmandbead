import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer or base64 to Cloudinary.
 */
export async function uploadImage(data, folder = 'ecom-products') {
  return new Promise((resolve, reject) => {
    // If it's a Buffer, convert to base64; otherwise use as is
    const dataURI = Buffer.isBuffer(data) 
      ? `data:image/jpeg;base64,${data.toString('base64')}` 
      : data;

    cloudinary.uploader.upload(dataURI, {
      folder: folder,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
    }, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });
  });
}

/**
 * Deletes an image from Cloudinary
 */
export async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
}