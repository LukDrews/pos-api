module.exports = function (debug, db, Prisma, userService, imageService) {
  const logger = debug.extend("users");

  const parameters = [
    {
      name: "uuid",
      in: "path",
      schema: {
        type: "string",
        format: "uuid",
      },
      required: true,
      description: "UUID of a User",
    },
  ];

  let operations = {
    parameters,
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const { uuid } = req.params;

    const { firstName, lastName, birthDate, roleUuid, groupUuid, barcode } =
      req.body;
    const file = req.files[0];

    try {
      const user = await userService.update(
        uuid,
        firstName,
        lastName,
        birthDate ? new Date(req.body.birthDate).toISOString() : undefined, // TODO pass Date not string
        roleUuid,
        groupUuid,
        barcode,
        file
      );
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await userService.getByUuid(uuid);
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

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await userService.delete(uuid);
      return res.json(user);
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
    summary: "Update user",
    description: "Update attributes of a user",
    operationId: "put-users-id",
    tags: [],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            $ref: "#/components/schemas/User",
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

  return operations;
};
