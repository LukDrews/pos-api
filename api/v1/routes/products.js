module.exports = function (debug, db) {
  const logger = debug.extend("products");
  const Product = db.product;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const name = req.body.name;
    const price = req.body.price;
    const barcode = req.body.barcode;

    try {
      const product = await Product.create({
        data: { name, price, barcode },
      });

      return res.json(product);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const products = await Product.findMany();
      return res.json(products);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create product",
    description: "Create a new product",
    operationId: "post-products",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Snicker",
              },
              price: {
                type: "integer",
                example: 100,
              },
              barcode: {
                type: "string",
                format: "ean13",
              },
            },
            required: ["name", "price"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A product was created",
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

  list.apiDoc = {
    summary: "Get all products",
    description: "Get all products",
    operationId: "get-products",
    tags: [],
    responses: {
      200: {
        description: "A list of all products",
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
