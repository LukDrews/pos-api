module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("cart");
  const CartItem = db.cartItem;
  const Product = db.product;

  let operations = {
    POST: add,
    GET: list,
  };
  /**
   * If product is in cart, increment count, else add product to cart
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#update-or-create-a-related-record
   */
  async function add(req, res, next) {
    let productUuid = req.body.productUuid;
    const barcode = req.body.barcode;
    try {
      const product = await Product.update({
        where: { uuid: productUuid, barcode },
        data: {
          cartItem: {
            upsert: {
              create: {},
              update: {
                count: {
                  increment: 1,
                },
              },
            },
          },
        },
        select: {
          cartItem: {
            include: { product: true },
          },
        },
      });
      return res.json(product.cartItem);
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
            oneOf: [
              {
                $ref: "#/components/schemas/ProductBarcodeSelect",
              },
              {
                properties: {
                  productUuid: {
                    type: "string",
                    format: "uuid"
                  },
                },
                required: ["productUuid"],
              },
            ],
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
