module.exports = function (debug, db) {
  const logger = debug.extend("carts");
  const Cart = db.models.Cart;
  const User = db.models.User;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const userUuid = req.body.userUuid;
    try {
      const user = await User.findOne({ where: { uuid: userUuid } });
      const cart = await Cart.create({ userId: user.id });
      return res.json(cart);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const carts = await Cart.findAll({include: "user"});
      return res.json(carts);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create cart",
    description: "Create a new cart",
    operationId: "post-carts",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              userUuid: {
                type: "string",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "A cart was created",
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
    summary: "Get all carts",
    description: "Get all carts",
    operationId: "get-carts",
    tags: [],
    responses: {
      200: {
        description: "A list of all carts",
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
