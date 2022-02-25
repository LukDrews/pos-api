// maybe use factory pattern here
const OrderService = require("./OrderService");
const TransactionService = require("./TransactionService");

module.exports = {
  create: (db, debug) => {
    const transactionService = new TransactionService(db, debug);
    const orderService = new OrderService(db, debug, transactionService);
    return {
      transactionService,
      orderService,
    };
  },
};
