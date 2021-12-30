module.exports = function (debug, db) {
  const logger = debug.extend("carts");
  const Cart = db.models.Cart;
  const Product = db.models.Product;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "UUID of a cart",
    },
  ];

  let operations = {
    PUT: add,
    GET: read,
    DELETE: del,
  };

  async function add(req, res, next) {
    const cartUuid = req.params.uuid;
    const productUuid = req.body.productUuid;
    try {
      const cart = await Cart.findOne({ where: { uuid: cartUuid } });
      // TODO add products here
      const product = await Product.findOne({ where: { uuid: productUuid } });
      cart.addItem(product);
      return res.json(cart);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const cart = await Cart.findOne({
        where: { uuid },
        include: {
          association: "items",
          through: {
            attributes: [],
          },
        },
      });
      return res.json(cart);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await Cart.destroy({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  add.apiDoc = {
    summary: "Add product",
    description: "Add product to cart",
    operationId: "put-carts-id",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            // TODO use component schema -> same for post/create
            type: "object",
            properties: {
              productUuid: {
                type: "string",
              },
            },
            required: ["productUuid"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A product was added",
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
    summary: "Get cart",
    description: "Get cart",
    operationId: "get-carts-id",
    tags: [],
    responses: {
      200: {
        description: "A cart with products",
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
    summary: "Delete cart",
    description: "Delete cart",
    operationId: "delete-carts-id",
    tags: [],
    responses: {
      200: {
        description: "A cart was deleted",
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
