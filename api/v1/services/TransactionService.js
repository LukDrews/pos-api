const Dinero = require("dinero.js");

module.exports = class TransactionService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug) {
    this.db = db;
    this.logger = debug.extend("transactions");
  }

  async create(amount, userUuid) {
    try {
      this.logger(`Create transaction ${amount}`);
      return await this.db.$transaction(async (tx) => {
        return await this.createCreditTransaction(tx, amount, userUuid);
      });
    } catch (error) {
      this.logger(error);
      throw error;
    }
  }

  /**
   *
   * @param {*} tx database transaction object
   * @param {number} amount
   * @param {string} userUuid
   * @param {string} orderUuid
   * @returns
   */
  async createCreditTransaction(tx, amount, userUuid) {
    // 1. Check if user has enough balance
    const currentUser = await tx.user.update({
      data: {
        balance: {
          increment: amount, // TODO test negative values
        },
      },
      where: { uuid: userUuid },
    });

    // 2. Check if user has enough money
    if (currentUser.balance < 0) {
      throw new Error(
        ` User (${userUuid}) doesn't have more than ${Dinero({
          amount: amount,
          currency: "EUR",
        })
          .setLocale("de-DE")
          .toFormat()} in his account`
      );
    }


    // 3. Create Credit transaction
    const transaction = await tx.transaction.create({
      data: {
        amount: amount,
        user: {
          connect: {
            uuid: userUuid,
          },
        },
      },
    });
    return transaction;
  }

  async getAll() {
    try {
      return await this.db.transaction.findMany({ include: { order: true } });
    } catch (error) {
      this.logger(error);
      throw error;
    }
  }
};
