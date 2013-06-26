var zeroTime = 1000000000 * 1000;

module.exports = {

  zeroTime: zeroTime,

  fetch: {
    "9780340831496": {
      "args": {
        "country": "GB",
        "currency": "GBP",
        "isbn": "9780340831496",
        "vendor": "test-vendor-1"
      },
      "url": "http://www.test-vendor-1.co.uk/9780340831496",
      "title": "McGee on Food and Cooking: An Encyclopedia of Kitchen Science, History and Culture",
      "authors": [
        "Harold McGee"
      ],
      "entries": [
        {
          "countries": [
            "GB"
          ],
          "currency": "GBP",
          "updated": zeroTime/1000,
          "formats": {
            "new": {
              "availabilityNote": "Despatched in 1 business day.",
              "price": 25.55,
              "shipping": 0,
              "shippingNote": "Free second class delivery in the UK for orders over £10",
              "total": 25.55
            }
          },
          "isbn": "9780340831496",
          "ttl": 86400,
          "url": "http://www.test-vendor-1.co.uk/9780340831496",
          "vendor": "test-vendor-1"
        },
        {
          "countries": [
            "AT", "BE", "DK", "FR", "DE", "GR", "IS", "IE", "IT", "LU", "NL",
            "PT", "ES", "SE", "CH"
          ],
          "currency": "GBP",
          "updated": zeroTime/1000,
          "formats": {
            "new": {
              "availabilityNote": "Despatched in 1 business day.",
              "price": 25.55,
              "shipping": 5,
              "shippingNote": "Air mail from UK: 4 - 14 days",
              "total": 30.55
            }
          },
          "isbn": "9780340831496",
          "ttl": 86400,
          "url": "http://www.test-vendor-1.co.uk/9780340831496",
          "vendor": "test-vendor-1"
        },
        {
          "countries": [
            "US", "CA"
          ],
          "currency": "GBP",
          "updated": zeroTime/1000,
          "formats": {
            "new": {
              "availabilityNote": "Despatched in 1 business day.",
              "price": 25.55,
              "shipping": 7,
              "shippingNote": "Air mail from UK: 4 - 14 days",
              "total": 32.55
            }
          },
          "isbn": "9780340831496",
          "ttl": 86400,
          "url": "http://www.test-vendor-1.co.uk/9780340831496",
          "vendor": "test-vendor-1"
        },
        {
          "countries": [
            "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS",
            "AU", "AW", "AZ", "BA", "BB", "BD", "BF", "BG", "BH", "BI", "BJ",
            "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY",
            "BZ", "CC", "CD", "CF", "CG", "CI", "CK", "CL", "CM", "CN", "CO",
            "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DJ", "DM", "DO", "DZ",
            "EC", "EE", "EG", "EH", "ER", "ET", "FI", "FJ", "FK", "FM", "FO",
            "GA", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP",
            "GQ", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT",
            "HU", "ID", "IL", "IM", "IN", "IO", "IQ", "IR", "JE", "JM", "JO",
            "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY",
            "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LV", "LY",
            "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN",
            "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY",
            "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NO", "NP", "NR", "NU",
            "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN",
            "PR", "PS", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA",
            "SB", "SC", "SD", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN",
            "SO", "SR", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG",
            "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW",
            "TZ", "UA", "UG", "UM", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
            "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"
          ],
          "currency": "GBP",
          "updated": zeroTime/1000,
          "formats": {
            "new": {
              "availabilityNote": "Despatched in 1 business day.",
              "price": 25.55,
              "shipping": 8,
              "shippingNote": "Air mail from UK: 7 - 21 days",
              "total": 33.55
            }
          },
          "isbn": "9780340831496",
          "ttl": 86400,
          "url": "http://www.test-vendor-1.co.uk/9780340831496",
          "vendor": "test-vendor-1"
        }
      ],
    },
  },

  getBookDetails: {
    "9780340831496": {
      isbn: "9780340831496",
      authors: [ "Harold McGee" ],
      title: "McGee on Food and Cooking: An Encyclopedia of Kitchen Science, History and Culture",
    },
  },

  getBookPricesForVendor: {
    "9780340831496": {
      "country": "GB",
      "currency": "GBP",
      "updated": zeroTime/1000,
      "ttl": 86400,
      "formats": {
        "new": {
          "availabilityNote": "Despatched in 1 business day.",
          "price": 25.55,
          "shipping": 0,
          "shippingNote": "Free second class delivery in the UK for orders over £10",
          "total": 25.55
        }
      },
      "isbn": "9780340831496",
      "url": "http://www.test-vendor-1.co.uk/9780340831496",
      "vendor": "test-vendor-1"
    },

    "9780340831496-pending": {
      status: "pending",
      retryDelay: 2,
      country: "GB",
      currency: "GBP",
      updated: null,
      ttl: 0,
      formats: {},
      isbn: "9780340831496",
      url: null,
      vendor: "test-vendor-1",
    },

  },

};


