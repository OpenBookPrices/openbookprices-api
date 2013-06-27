"use strict";

module.exports.cacheControl = function (amount) {
  amount = amount || 0;
  amount = parseFloat(amount, 10);
  amount = Math.floor(amount);

  return amount > 0 ? "max-age=" + amount : "no-cache";
};
