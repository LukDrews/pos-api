module.exports = function (debug, prismaDB, Prisma) {
  const logger = debug.extend("carts");
  const CartItem = prismaDB.cartItem;
  const Product = prismaDB.product;

  let operations = {
    POST: add,
    GET: list,
    DELETE: remove,
  };

  async function add(req, res, next) {
    const productUuid = req.body.productUuid;
    try {
      const product = await Product.findUnique({
        where: { uuid: productUuid },
      });
      // if item in cart, increment count, else add item to cart
      let cartItem = await CartItem.upsert({
        where: { productId: product.id },
        update: {
          count: {
            increment: 1,
          },
        },
        create: {
          productId: product.id,
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

  async function remove(req, res, next) {
    const productUuid = req.body.productUuid;
    try {
      const product = await Product.findUnique({
        where: { uuid: productUuid },
      });

      const cartItem = await CartItem.update({
        where: { productId: product.id },
        data: {
          count: {
            decrement: 1,
          },
        },
      });

      if (cartItem.count === 0) {
        await CartItem.delete({
          where: { productId: product.id },
        });
        return res.json();
      } else {
        return res.json(cartItem);
      }
    } catch (err) {
      logger(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: An operation failed because it depends on one or more records that were required but not found.
        if (err.code === "P2025") {
          res.status(404).json();
        }
      }
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

  remove.apiDoc = {
    summary: "Remove item",
    description: "Remove item from the cart",
    operationId: "delete-cart",
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
        description: "An item was removed from the cart",
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
