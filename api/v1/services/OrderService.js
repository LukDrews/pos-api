const Dinero = require("dinero.js");

module.exports = class OrderService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug, transactionService) {
    this.db = db;
    this.logger = debug.extend("orders");
    this.transactionService = transactionService;
  }

  /**
   *
   * @param {*} userUuid
   * @returns
   * @description
   *     Flow:
   *     -> transaction starts here
   *     1. Check if items in cart
   *     2. Get total amount
   *     3. Create order
   *     4. Create credit transaction
   *     5. Delete cart items
   *     -> transaction ends here
   *     Sources:
   *     https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#scenario-pre-computed-ids-and-the-transaction-api
   *     https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions-in-preview
   */
  async create(userUuid) {
    return await this.db.$transaction(async (tx) => {
      // 1. Check if items in cart
      const cartCount = await tx.cartItem.count();
      if (cartCount === 0) {
        throw new Error("No items in cart.");
      }

      // 2. Get total amount
      const cartItems = await tx.cartItem.findMany({
        select: { product: true, count: true },
      });
      let totalAmount = 0;
      const items = [];
      for (const cartItem of cartItems) {
        const product = cartItem.product;
        // Calculate and save the total amount to accommodate for price changes.
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
          amount,
        });
      }

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          user: {
            connect: {
              uuid: userUuid,
            },
          },
          amount: totalAmount,
          items: {
            create: items,
          },
        },
        include: { items: true },
      });

      // 4. Create credit transaction
      await this.transactionService.createCreditTransaction(
        tx,
        -totalAmount, // negate amount because its a withdrawal
        userUuid,
        order.uuid
      );

      // 5. Delete cart items
      await tx.cartItem.deleteMany({});
      return order;
    });
  }

  async getAll() {
    try {
      const orders = await this.db.order.findMany({
        include: { items: true },
      });
      return orders;
    } catch (error) {
      this.logger(error);
      throw error;
    }
  }
};
