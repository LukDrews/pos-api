module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("cart");
  const CartItem = db.cartItem;

  let operations = {
    POST: add,
    GET: list,
  };

  async function add(req, res, next) {
    const productUuid = req.body.productUuid;
    try {
      // if item in cart, increment count, else add item to cart
      let cartItem = await CartItem.upsert({
        where: { productUuid },
        update: {
          count: {
            increment: 1,
          },
        },
        create: {
          productUuid,
        },
      });
      return res.json(cartItem);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const items = await CartItem.findMany({
        include: {
          product: true,
        },
      });
      return res.json(items);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  add.apiDoc = {
    summary: "Add item",
    description: "Add item to the cart",
    operationId: "post-cart",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              productUuid: {
                type: "string",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "An item was added to the cart",
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
    summary: "Get items",
    description: "Get all items from the cart",
    operationId: "get-cart",
    tags: [],
    responses: {
      200: {
        description: "A list of all items from the cart",
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
