/**
 *
 * @param {import("debug").Debugger} debug
 * @param {import("../services/TransactionService")} transactionService
 * @returns
 */
module.exports = function (debug, transactionService) {
  const logger = debug.extend("transactions");

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const amount = req.body.amount;
    const userUuid = req.body.userUuid;

    try {
      const transaction = await transactionService.create(amount, userUuid);
      return res.json(transaction);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const transactions = await transactionService.getAll();
      return res.json(transactions);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create transaction",
    description: "Create a new transaction",
    operationId: "post-transactions",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            properties: {
              userUuid: {
                type: "string",
                format: "uuid",
              },
              amount: {
                type: "integer",
              },
            },
            required: ["userUuid", "amount"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A transaction was created",
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
    summary: "Get all transactions",
    description: "Get all transactions",
    operationId: "get-transactions",
    tags: [],
    responses: {
      200: {
        description: "A list of all transactions",
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
