"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ourFileRouter = void 0;

var _next = require("uploadthing/next");

var f = (0, _next.createUploadthing)();
var ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB"
    }
  }).onUploadComplete(function _callee(_ref) {
    var file;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            file = _ref.file;
            return _context.abrupt("return", {
              url: file.url
            });

          case 2:
          case "end":
            return _context.stop();
        }
      }
    });
  })
};
exports.ourFileRouter = ourFileRouter;