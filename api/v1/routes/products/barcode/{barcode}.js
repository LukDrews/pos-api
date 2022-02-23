module.exports = function (debug, db) {
  const logger = debug.extend("products");
  const Product = db.product;

  // setup path parameters
  const parameters = [
    {
      $ref: "#/components/parameters/ProductBarcodeParameter",
    },
  ];

  let operations = {
    parameters,
    GET: read,
  };

  async function read(req, res) {
    const barcode = req.params.barcode;
    try {
      const product = await Product.findUnique({
        where: { barcode },
      });
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json();
      }
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  read.apiDoc = {
    summary: "Get product",
    description: "Get product via barcode",
    operationId: "get-product-barcode-barcode",
    tags: [],
    responses: {
      200: {
        description: "A product",
        content: {
          "application/json": {
            schema: {},
          },
        },
      },
      default: {
        description: "An error occurred",
      },
    },
  };

  return operations;
};
