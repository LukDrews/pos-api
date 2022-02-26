// maybe use factory pattern here
const ImageService = require("./ImageService");
const OrderService = require("./OrderService");
const TransactionService = require("./TransactionService");

module.exports = {
  create: (db, debug) => {
    const imageService = new ImageService(debug);
    const transactionService = new TransactionService(db, debug);
    const orderService = new OrderService(db, debug, transactionService);
    return {
      imageService,
      transactionService,
      orderService,
    };
  },
};
