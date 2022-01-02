module.exports = function (debug, db) {
  const logger = debug.extend("orders");
  const Order = db.models.Order;
  const OrderItem = db.models.OrderItem;
  const User = db.models.User;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const userUuid = req.body.userUuid;

    try {
      const user = await User.findOne({ where: { uuid: userUuid } });
      const order = await Order.create({ userId: user.id });
      return res.json(order);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const orders = await Order.findAll({ include: ["user", "items"] });
      return res.json(orders);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create order",
    description: "Create a new order",
    operationId: "post-orders",
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
            required: ["userUuid"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A order was created",
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
    summary: "Get all orders",
    description: "Get all orders",
    operationId: "get-orders",
    tags: [],
    responses: {
      200: {
        description: "A list of all orders",
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
