const { ValidationError } = require("../utils/errors");
module.exports = function (debug, prismaDB, sharp) {
  const logger = debug.extend("users");
  const User = prismaDB.user;
  const Role = prismaDB.role;
  const Group = prismaDB.group;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const birthDate = new Date(req.body.birthDate).toISOString();
    const role = req.body.role;
    const group = req.body.group;
    const image = req.files[0];

    const roleDB = await Role.findUnique({ where: { name: role } });

    const groupDB = await Group.findUnique({ where: { name: group } });

    try {
      let link = null;
      if (image) {
        const { buffer, originalname } = image;
        const timestamp = new Date().toISOString();
        const ref = `${timestamp}-${originalname}.webp`;
        await sharp(buffer)
          .webp({ quality: 20 })
          .toFile("./uploads/" + ref);
        link = `http://localhost:3000/${ref}`;
      }

      const user = await User.create({
        data: {
          firstName,
          lastName,
          birthDate,
          role: {
            connect: {
              id: roleDB.id,
            },
          },
          group: {
            connect: {
              id: groupDB.id,
            },
          },
          imageLink: link,
        },
        include: {
          role: true,
          group: true,
        },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function list(req, res, next) {
    try {
      const users = await User.findMany({
        include: { group: true, role: true },
      });
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
            type: "object",
            required: ["firstName", "lastName", "birthDate", "group", "role"],
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
              image: {
                type: "string",
                format: "binary",
              },
            },
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
