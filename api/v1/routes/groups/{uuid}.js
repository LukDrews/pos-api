module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("groups");
  const Group = db.group;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "Uuid of a group",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const uuid = req.params.uuid;
    const name = req.body.name;
    try {
      const group = await Group.update({
        where: { uuid },
        data: { name },
      });
      return res.json(group);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const group = await Group.findUnique({
        where: { uuid },
        include: {
          users: true,
        },
      });
      return res.json(group);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await Group.delete({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
      logger(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: An operation failed because it depends on one or more records that were required but not found.
        if (err.code === "P2025") {
          return res.status(404).json();
        }
      }
      return res.status(500).json();
    }
  }

  update.apiDoc = {
    summary: "Update group",
    description: "Update attributes of a group",
    operationId: "put-groups-id",
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
                example: "Group 1",
              },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "A group was updated",
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
    summary: "Get group",
    description: "Get group",
    operationId: "get-groups-id",
    tags: [],
    responses: {
      200: {
        description: "A group",
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
    summary: "Delete group",
    description: "Delete group",
    operationId: "delete-groups-id",
    tags: [],
    responses: {
      200: {
        description: "A group was deleted",
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
