# l2b-api

[![Build Status](https://secure.travis-ci.org/LinkToBooks/l2b-api.png)](http://travis-ci.org/LinkToBooks/l2b-api)

LinkToBooks API for book and price data





## URLs

### /books

Not defined yet

### /books/<isbn>

Book details for this isbn - such as title, author, etc.

### /books/<isbn>/prices/

Not defined

### /books/<isbn>/prices/<country>

Not defined

### /books/<isbn>/prices/<country>/<currency>

`country` is the two letter ISO code, in capitals (eg 'GB' for the United Kingdom).

`currency` is the three letter code ISO currency code (eg 'USD' for US Dollars).

Returns an array of all the prices for this book in this country. May contain entries that have not yet been fetched, these should be queried individually.

Cache-ability will be set to the first entry to expire, or 60 seconds, whichever is greatest.

### /books/<isbn>/prices/<country>/<currency>/vendor

Returns the price for this `country`, `currency` and vendor. Can be made to be blocking by adding the `wait_until_fresh=1` parameter. Even with this parameter a stale response may be returned. If so retry. (This is to prevent the CloudFront proxy caches from timing out - max response time is 8 seconds, which is not long enough for some of the scrapers.) Response will be cacheable until it is no longer fresh.

## Sample price response

```javascript
{
  isbn:
  country:
  currency:
  vendor:
  
  expires:

  canSell: bool,
  canSellComment: '',

  availability:
  availabilityComment:

  shipping:
  shippingComment:

  price:
  total:

  isConverted: true,
  originalCurrency: 'GBP'
  originalPrice:
  originalShipping:
  originalTotal:

  exchangeRate: 1.23,

}
```

### isbn

Text. The full 13 digit isbn of the book. This is the same as the EAN.

### country

Text. The two letter ISO country code for the delivery country that these prices are for. 

### currency

The three letter ISO currency code that represents the currency that the `price`, `shipping` and `total` prices are provided in (either from the vendor, or converted - see details on exchange rates below.)

### vendor

The LinkToBooks code for the vendor. This is lowercase and is made up of letters, numbers and dashes (`-`).

### canSell

Boolean. `true` if the vendor can supply the book in the country requested, `false` if not. If it was not possible to get a price from the vendor (eg because their site is down or the scraper is broken) then this will be `false`.

### canSellComment

Text. A comment adding more information about the `canSell` status. May be empty if there is no comment.

### isAvailable

Bool. `true` if the book is available - eg it is in stock, it can be printed on demand, it is available for preorder. `false` if it is not available - eg it is out of stock, back ordered, no longer available.

This will be set to `false` if `canSell` is `false`.

### availabilityComment

Text. A bit of text describing the exact availability. This will vary from vendor to vendor as it is taken from their site.

### shipping

Float. The cost of shipping this book if it was the only thing purchased from the vendor.

### shippingComment

Text. Possible further details about the shipping - eg "Orders over $20 shipped free".

### price

Float. The price of the book.

### total

Float. The `price` of the book, plus the `shipping`.

### isConverted

Bool. `true` if the vendor does not list prices in the requested `currency` and so a conversion has been made on the server. `false` otherwise.

### originalCurrency

Text. Three letter ISO code for the currency that the vendor listed the product in.

### originalPrice

Float. The price of the book in the `originalCurrency`.

### originalShipping

Float. The shipping cost in the `originalCurrency`.

### originalTotal

Float. The total cost in the `originalCurrency`. (`originalPrice` + `originalShipping`).

### exchangeRate

Float. The amount in 'originalCurrency' that corresponds to 1 of 'currency'. So
if you request price in USD, but the seller sells in GBP then the 'exchangeRate'
is the amount in GBP that corresponds to 1 USD. We use the requested currency as
the 'base' because that will be consistent across the prices in a .


If the vendor does not sell in the requested currency a conversion will be
made on the server. As exchange rates vary by time, and by who's doing it, the
original prices and exchange rates are provided so they can be displayed. If no
conversion occurred then isConverted is false and the related fields absent.
Currency fluctuations are not taken into account when setting the freshness.

