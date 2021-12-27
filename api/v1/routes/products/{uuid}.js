module.exports = function (debug, db) {
  const logger = debug.extend("products");
  const Product = db.models.Product;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "UUID of a Product",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const productUuid = req.params.uuid;
    try {
      const product = await Product.findOne({ where: { uuid: productUuid } });
      product.update(req.body);
      return res.json(product);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const product = await Product.findOne({
        where: { uuid },
      });
      return res.json(product);
    } catch (err) {
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await Product.destroy({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
      return res.status(500).json();
    }
  }

  update.apiDoc = {
    summary: "Update product",
    description: "Update attributes of a product",
    operationId: "put-product-id",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            // TODO use component schema -> same for post/create
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Snickers",
              },
              barcode: {
                type: "string",
                pattern: "^[0-9]{13}$"
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "A product was updated",
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

  read.apiDoc = {
    summary: "Get product",
    description: "Get product",
    operationId: "get-products-id",
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

  del.apiDoc = {
    summary: "Delete product",
    description: "Delete product",
    operationId: "delete-products-id",
    tags: [],
    responses: {
      200: {
        description: "A product was deleted",
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

  return {
    ...operations,
    ...parameters,
  };
};
