module.exports = function (debug, db) {
  const logger = debug.extend("groups");
  const Group = db.models.Group;

  const parameters = [
    {
      name: "uuid",
      in: "path",
      type: "string",
      required: true,
      description: "UUID of a Group",
    },
  ];

  let operations = {
    PUT: update,
    GET: read,
    DELETE: del,
  };

  async function update(req, res, next) {
    const groupUuid = req.params.uuid;
    try {
      const group = await Group.findOne({ where: { uuid: groupUuid } });
      group.update(req.body);
      return res.json(group);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const group = await Group.findOne({
        where: { uuid },
      });
      return res.json(group);
    } catch (err) {
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      await Group.destroy({
        where: { uuid },
      });
      return res.json();
    } catch (err) {
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
