module.exports = function (debug, db) {
  const logger = debug.extend("hroups");
  const Group = db.models.Group;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const name = req.body.name;

    try {
      const group = await Group.create({ name });
      return res.json(group);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const groups = await Group.findAll({include: 'users'});
      return res.json(groups);
    } catch (err) {
      return res.status(500).json();
    }
  }

  create.apiDoc = {
    summary: "Create group",
    description: "Create a new group",
    operationId: "post-groups",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
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
        description: "A group was created",
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
    summary: "Get all groups",
    description: "Get all groups",
    operationId: "get-users",
    tags: [],
    responses: {
      200: {
        description: "A list of all groups",
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
