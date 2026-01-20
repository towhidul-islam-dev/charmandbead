"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadImage = uploadImage;
exports.deleteImage = deleteImage;

var _cloudinary = require("cloudinary");

_cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
/**
 * Uploads a file buffer or base64 to Cloudinary.
 */


function uploadImage(data) {
  var folder,
      _args = arguments;
  return regeneratorRuntime.async(function uploadImage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          folder = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'ecom-products';
          return _context.abrupt("return", new Promise(function (resolve, reject) {
            // If it's a Buffer, convert to base64; otherwise use as is
            var dataURI = Buffer.isBuffer(data) ? "data:image/jpeg;base64,".concat(data.toString('base64')) : data;

            _cloudinary.v2.uploader.upload(dataURI, {
              folder: folder,
              transformation: [{
                width: 400,
                height: 400,
                crop: "fill",
                gravity: "face"
              }]
            }, function (error, result) {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            });
          }));

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
}
/**
 * Deletes an image from Cloudinary
 */


function deleteImage(publicId) {
  return regeneratorRuntime.async(function deleteImage$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (publicId) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return");

        case 2:
          _context2.prev = 2;
          _context2.next = 5;
          return regeneratorRuntime.awrap(_cloudinary.v2.uploader.destroy(publicId));

        case 5:
          return _context2.abrupt("return", _context2.sent);

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](2);
          console.error("Cloudinary Delete Error:", _context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 8]]);
}