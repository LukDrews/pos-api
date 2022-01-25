module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("roles");
  const Role = db.role;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      schema: {
        type: "string",
      },
      required: true,
      description: "Uuid of a role",
    },
  ];

  let operations = {
    parameters,
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const uuid = req.params.uuid;
    const name = req.body.name;
    try {
      const role = await Role.update({
        where: { uuid },
        data: { name },
      });
      return res.json(role);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const role = await Role.findUnique({
        where: { uuid },
        include: {
          users: true,
        },
      });
      return res.json(role);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await Role.delete({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2003") {
          return res.status(409).json({
            msg: "can't delete resource with entities attached. Remove all entities from the resource and try again.",
          });
        } else if (err.code === "P2025") {
          // P2025: An operation failed because it depends on one or more records that were required but not found.
          return res.status(404).json();
        }
      } else {
        logger(err);
        return res.status(500).json();
      }
    }
  }

  update.apiDoc = {
    summary: "Update role",
    description: "Update attributes of a role",
    operationId: "put-roles-id",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            // TODO use component schema -> same for post/create
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "customer",
              },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A role was updated",
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
    summary: "Get role",
    description: "Get role",
    operationId: "get-roles-id",
    tags: [],
    responses: {
      200: {
        description: "A role",
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
    summary: "Delete role",
    description: "Delete role",
    operationId: "delete-roles-id",
    tags: [],
    responses: {
      200: {
        description: "A role was deleted",
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

  return operations
};
