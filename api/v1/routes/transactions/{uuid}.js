module.exports = function (debug, db) {
  const logger = debug.extend("transaction");
  const Transaction = db.models.Transaction;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "UUID of a transaction",
    },
  ];

  let operations = {
    GET: read,
    DELETE: del,
  };

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const transaction = await Transaction.findOne({
        where: { uuid },
        include: "user",
      });
      return res.json(transaction);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await Transaction.destroy({
        where: { uuid },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  read.apiDoc = {
    summary: "Get transaction",
    description: "Get a transaction",
    operationId: "get-transaction-id",
    tags: [],
    responses: {
      200: {
        description: "A transaction",
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

  del.apiDoc = {
    summary: "Delete transaction",
    description: "Delete transaction",
    operationId: "delete-transaction-id",
    tags: [],
    responses: {
      200: {
        description: "A transaction was deleted",
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

  return {
    ...operations,
    ...parameters,
  };
};
