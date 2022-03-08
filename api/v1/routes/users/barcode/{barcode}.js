module.exports = function (debug, userService) {
  const logger = debug.extend("user");

  const parameters = [
    {
      name: "barcode",
      in: "path",
      schema: {
        type: "string",
        format: "userBarcode",
      },
      required: true,
      description: "Barcode of a user",
    },
  ];

  let operations = {
    parameters,
    GET: read,
  };

  async function read(req, res) {
    const { barcode } = req.params;
    try {
      const user = await userService.getByBarcode(barcode);
      if (user) {
        return res.json(user);
      } else {
        return res.status(404).json();
      }
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  read.apiDoc = {
    summary: "Get user",
    description: "Get user via barcode",
    operationId: "get-user-barcode-barcode",
    tags: [],
    responses: {
      200: {
        description: "A user",
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
