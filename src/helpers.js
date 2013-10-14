"use strict";

module.exports.cacheControl = function (amount, priv) {
  amount = amount || 0;
  amount = parseFloat(amount, 10);
  amount = Math.floor(amount);

  var visibility = priv ? "private, " : "public, ";

  return amount > 0 ? visibility+"max-age=" + amount : "no-cache";
};
