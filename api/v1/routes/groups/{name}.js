module.exports = function (debug, prismaDB) {
  const logger = debug.extend("groups");
  const Group = prismaDB.group;

  const parameters = [
    {
      name: "name",
      in: "path",
      type: "string",
      required: true,
      description: "name of a group",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const name = req.params.name;
    const newName = req.body.name;
    try {
      const group = await Group.update({
        where: { name },
        data: { name: newName },
      });
      return res.json(group);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const name = req.params.name;
    try {
      const group = await Group.findUnique({
        where: { name },
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
    const name = req.params.name;
    try {
      await Group.delete({
        where: { name },
      });
      return res.json();
    } catch (err) {
      logger(err);
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
