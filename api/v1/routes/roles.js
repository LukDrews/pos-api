module.exports = function (debug, db) {
    const logger = debug.extend("roles");
    const Role = db.models.Role;
  
    let operations = {
      POST: create,
      GET: list,
    };
  
    async function create(req, res, next) {
      const name = req.body.name;
  
      try {
        const role = await Role.create({ name });
        return res.json(role);
      } catch (err) {
        logger(err);
        return res.status(500).json();
      }
    }
  
    async function list(req, res, next) {
      try {
        const roles = await Role.findAll();
        return res.json(roles);
      } catch (err) {
        logger(err);
        return res.status(500).json();
      }
    }
  
    create.apiDoc = {
      summary: "Create role",
      description: "Create a new role",
      operationId: "post-roles",
      tags: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
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
          description: "A role was created",
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
      summary: "Get all roles",
      description: "Get all roles",
      operationId: "get-roles",
      tags: [],
      responses: {
        200: {
          description: "A list of all roles",
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
  