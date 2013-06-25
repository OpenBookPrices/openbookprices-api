# l2b-api

[![Build Status](https://secure.travis-ci.org/LinkToBooks/l2b-api.png)](http://travis-ci.org/LinkToBooks/l2b-api)

LinkToBooks API for book and price data





## URLs

### /books

Not defined yet

### /books/:isbn

Book details for this isbn - such as title, author, etc.

### /prices/:isbn

Geolocates the request and redirects to `/prices/:isbn/:country/:currency`.

### /prices/:isbn/:country

Redirects to `/prices/:isbn/:country/:currency` where `:currency` is the primary currency for that country.

### /prices/:isbn/:country/:currency

`country` is the two letter ISO code, in capitals (eg 'GB' for the United Kingdom).

`currency` is the three letter ISO currency code (eg 'USD' for US Dollars).

Returns an array of all the prices for this book in this country. May contain entries that have not yet been fetched, these should be queried individually.

Cache-ability will be set to the first entry to expire, or 60 seconds, whichever is greatest.

### /prices/:isbn/:country/:currency/:vendor

Returns the price for this `country`, `currency` and vendor. Can be made to be blocking by adding the `wait_until_fresh=1` parameter. Even with this parameter a stale response may be returned. If so retry. (This is to prevent the CloudFront proxy caches from timing out - max response time is 8 seconds, which is not long enough for some of the scrapers.) Response will be cacheable until it is no longer fresh.

## Sample price response

``` json
{
  "isbn": "9780340831496",
  "country": "GB",
  "currency": "USD",
  "vendor": "test-vendor-1",

  "preConversionCurrency": "GBP",

  "url": "http://www.test-vendor-1.co.uk/9780340831496",

  "updated": 123456789,
  "ttl":     86400,
  "status": "ok",
  "retryDelay": null,

  "prices": {
    "new": {
      "price": 25.55,
      "shipping": 0,
      "total": 25.55,
      "shippingNote": "Free second class delivery in the UK for orders over £10",
      "availabilityNote": "Despatched in 1 business day."
    },
  }
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

### preConversionCurrency

Text. Three letter ISO code for the currency that the vendor listed the product in. If this is `null` it was the same as `currency`. If not `null` then the prices have been converted to `currency` from `preConversionCurrency`.

### prices

Hash. A hash with the keys being the category of the book: `new`, `used`, `ebook`. If a key is missing it means that the `vendor` does not stock that category. If all are missing then the book is not available.


#### price

Float. The price of the book.

#### shipping

Float. The cost of shipping this book if it was the only thing purchased from the vendor.

#### total

Float. The `price` of the book, plus the `shipping`.

#### shippingNote

Text. Possible further details about the shipping - eg "Orders over $20 shipped free".

#### availabilityNote

Text. A bit of text describing the exact availability. This will vary from vendor to vendor as it is taken from their site.

### updated

Integer. When the information was last updated. Seconds since epoch.

### ttl

Integer. How many seconds from `updated` this information should be considered fresh for.

### status

Text. A description of the status of this response. Possible values are:

- `ok`: The data is fresh and can be displayed
- `pending`: The price data is being fetched, but is not available yet.
- `stale`: The price data has been fetched in the past but is now too old to be trusted. New data is being fetched, but old data is still available.
- `error`: There is an error fetching the price data.

### retryDelay

The number of seconds to wait before requesting the data again. In the case of `pending` or `stale` responses this will typically be low. If `fresh` or `error` it will generally be `null`. When it is `null` the `updated` and `ttl` values should be used to decide when to fetch new data. This field is intended as a convenience for code running on machines where the clock may not be accurate (eg in a web browser as the user may not have their clock correctly set) and to make the retry decision logic simpler (if `retryDelay` has a value then wait that number of seconds and go again).
