module.exports = function (debug, db, Dinero) {
  const logger = debug.extend("orders");
  const Order = db.order;
  const OrderItem = db.orderItem;
  const User = db.user;
  const CartItem = db.cartItem;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const userUuid = req.body.userUuid;

    try {
      const cartItems = await CartItem.findMany({ select: { product: true, count: true } });
      const user = {
        connect: {
          uuid: userUuid,
        },
      };

      // create OrderItems
      let totalAmount = 0;
      const items = [];
      for (const cartItem of cartItems) {
        const product = cartItem.product;
        // Calculate and save the total amount to accommodate price changes.
        const amount = Dinero({ amount: product.price })
          .multiply(cartItem.count)
          .getAmount();
        totalAmount += amount;

        items.push({
          product: {
            connect: {
              uuid: product.uuid,
            },
          },
          count: cartItem.count,
          amount: amount,
        });
      }
      const order = await Order.create({
        data: {
          user,
          amount: totalAmount,
          items: {
            create: items,
          },
        },
        include: { items: true },
      });

      await CartItem.deleteMany({});
      return res.json(order);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const orders = await Order.findMany({
        include: { user: true, items: true },
      });
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
