module.exports = function (debug, db) {
  const logger = debug.extend("users");
  const User = db.user;
  const Role = db.role;
  const Group = db.group;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "UUID of a User",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const userUuid = req.params.uuid;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const birthDate = new Date(req.body.birthDate).toISOString();
    const role = req.body.role;
    const group = req.body.group;

    try {
      // TODO add error handling for
      const roleDB = await Role.findUnique({ where: { name: role } });
      const groupDB = await Group.findUnique({ where: { name: group } });
      const user = await User.update({
        where: { uuid: userUuid },
        data: {
          firstName,
          lastName,
          birthDate,
          roleId: roleDB.id,
          groupId: groupDB.id,
        },
        include: { role: true, group: true, orders: true },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await User.findUnique({
        where: { uuid },
        include: { role: true, group: true, orders: true },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await User.delete({
        where: { uuid },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  update.apiDoc = {
    summary: "Update user",
    description: "Update attributes of a user",
    operationId: "put-users-id",
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
              birthDate: {
                type: "string",
                format: "date",
                example: "2017-07-21",
              },
              role: {
                type: "string",
                example: "customer",
              },
              group: {
                type: "string",
                example: "Group 1",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "A user was updated",
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

  read.apiDoc = {
    summary: "Get user",
    description: "Get user",
    operationId: "get-users-id",
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

  del.apiDoc = {
    summary: "Delete user",
    description: "Delete user",
    operationId: "delete-users-id",
    tags: [],
    responses: {
      200: {
        description: "A user was deleted",
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
