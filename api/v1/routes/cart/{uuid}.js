module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("cart");
  const CartItem = db.cartItem;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "Uuid of a cartItem",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const uuid = req.params.uuid;
    const count = req.body.count;
    try {
      const cartItem = await CartItem.update({
        where: { uuid },
        data: { count },
      });
      return res.json(cartItem);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const cartItem = await CartItem.findUnique({
        where: { uuid },
        include: {
          product: true,
        },
      });
      return res.json(cartItem);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await CartItem.delete({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
      logger(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: An operation failed because it depends on one or more records that were required but not found.
        if (err.code === "P2025") {
          return res.status(404).json();
        }
      }
      return res.status(500).json();
    }
  }

  update.apiDoc = {
    summary: "Update cart item",
    description: "Update attributes of a cart item",
    operationId: "put-cart-items-id",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            // TODO use component schema -> same for post/create
            type: "object",
            properties: {
              count: {
                type: "number",
                example: 4,
              },
            },
            required: ["count"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A cart item was updated",
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
    summary: "Get cart item",
    description: "Get cart item",
    operationId: "get-cart-items-id",
    tags: [],
    responses: {
      200: {
        description: "A cart item",
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
    summary: "Delete cart item",
    description: "Delete cart item",
    operationId: "delete-cart-items-id",
    tags: [],
    responses: {
      200: {
        description: "A cart item was deleted",
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
