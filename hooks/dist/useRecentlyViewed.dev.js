"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addToRecentlyViewed = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// hooks/useRecentlyViewed.js
var addToRecentlyViewed = function addToRecentlyViewed(product) {
  if (typeof window === "undefined" || !product) return;
  var storageKey = "recently_viewed_j_materials";
  var existing = JSON.parse(localStorage.getItem(storageKey) || "[]"); // Keep only unique items, and limit to the last 4-8 items

  var filtered = existing.filter(function (item) {
    return item._id !== product._id;
  });
  var updated = [product].concat(_toConsumableArray(filtered)).slice(0, 8);
  localStorage.setItem(storageKey, JSON.stringify(updated));
};

exports.addToRecentlyViewed = addToRecentlyViewed;