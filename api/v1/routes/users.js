module.exports = function (debug, userService) {
  const logger = debug.extend("users");

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const {
      firstName,
      lastName,
      roleUuid,
      groupUuid,
      barcode,
    } = req.body;

    const generateBarcode = req.body.generateBarcode === "true" 
    const birthDate = new Date(req.body.birthDate).toISOString();
    const file = req.files[0];

    try {
      const user = await userService.create(
        firstName,
        lastName,
        birthDate,
        roleUuid,
        groupUuid,
        barcode,
        generateBarcode,
        file
      );
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create user",
    description: "Create a new user",
    operationId: "post-users",
    tags: [],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            allOf: [
              {
                $ref: "#/components/schemas/User",
              },
              {
                required: [
                  "firstName",
                  "lastName",
                  "birthDate",
                  "groupUuid",
                  "roleUuid",
                ],
              },
            ],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A user was created",
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
    summary: "Get all users",
    description: "Get all users",
    operationId: "get-users",
    tags: [],
    responses: {
      200: {
        description: "A list of all users",
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
