"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateShipping = void 0;

var calculateShipping = function calculateShipping(city) {
  if (!city) return 0;
  var DHAKA_ZONES = ["Badda", "Banani", "Gulshan", "Mirpur"
  /* ... others */
  ];
  var isInside = DHAKA_ZONES.some(function (zone) {
    return city.toLowerCase().includes(zone.toLowerCase()) || city.toLowerCase() === "dhaka";
  });
  return isInside ? 80 : 130;
};

exports.calculateShipping = calculateShipping;