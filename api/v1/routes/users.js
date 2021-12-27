module.exports = function (debug, db) {
  const logger = debug.extend("users");
  const User = db.models.User;
  const Group = db.models.Group;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const balance = req.body.balance;
    const birthDate = req.body.birthDate;
    const role = req.body.role;
    const groupName = req.body.groupName;

    const group = await Group.findOne({ where: { name: groupName } });
    try {
      const user = await User.create({
        firstName,
        lastName,
        balance,
        birthDate,
        role,
        groupId: group.id,
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const users = await User.findAll({ include: "group" });
      return res.json(users);
    } catch (err) {
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create user",
    description: "Create a new user",
    operationId: "post-users",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              firstName: {
                type: "string",
                example: "Max",
              },
              lastName: {
                type: "string",
                example: "Mustermann",
              },
              balance: {
                type: "number",
                example: 25,
              },
              birthDate: {
                type: "string",
                format: "date",
                example: "2017-07-21",
              },
              role: {
                type: "string",
                enum: ["admin", "staff", "customer"],
                example: "customer",
              },
              groupName: {
                type: "string",
                example: "Group 1",
              },
            },
            required: ["firstName", "lastName", "birthDate", "role"],
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
