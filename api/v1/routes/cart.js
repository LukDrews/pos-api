module.exports = function (debug, db) {
  const logger = debug.extend("carts");
  const CartItem = db.models.CartItem;
  const Product = db.models.Product;

  let operations = {
    POST: add,
    GET: list,
    DELETE: remove,
  };

  async function add(req, res, next) {
    const productUuid = req.body.productUuid;
    try {
      const product = await Product.findOne({ where: { uuid: productUuid } });
      // if item in cart, increment count, else add item to cart
      let cartItem = await CartItem.findOne({
        where: { productId: product.id },
      });
      if (cartItem) {
        cartItem.count++;
        cartItem.save()
      } else {
        cartItem = await CartItem.create({ productId: product.id });
      }
      return res.json(cartItem);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const items = await CartItem.findAll({ include: "product" });
      logger(items);
      return res.json(items);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function remove(req, res, next) {
    const cartItemUuid = req.body.uuid;
    try {
      await CartItem.destroy({
        where: { uuid: cartItemUuid },
      });
    } catch (error) {}
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
