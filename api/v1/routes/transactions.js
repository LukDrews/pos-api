module.exports = function (debug, db) {
  const logger = debug.extend("transactions");
  const Transaction = db.models.Transaction;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const amount = req.body.amount;
    const count = req.body.count;

    try {
      const transaction = await Transaction.create({ amount, count });
      return res.json(transaction);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const transactions = await Transaction.findAll();
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
            type: "object",
            properties: {
              userUuid: {
                type: "string",
                pattern:
                  "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$",
              },
              productUuid: {
                type: "string",
                pattern:
                  "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$",
              },
              amount: {
                type: "integer",
                example: 100,
              },
              count: {
                type: "integer",
                example: 2,
              },
            },
            required: ["amount"],
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
    operationId: "get-users",
    tags: [],
    responses: {
      200: {
        description: "A list of all transaction",
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
