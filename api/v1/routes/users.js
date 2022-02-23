const { ValidationError } = require("../utils/errors");
module.exports = function (debug, db) {
  const logger = debug.extend("users");
  const User = db.user;

  let operations = {
    POST: create,
    GET: list,
  };

  async function create(req, res, next) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const birthDate = new Date(req.body.birthDate).toISOString();
    const roleUuid = req.body.roleUuid;
    const groupUuid = req.body.groupUuid;
    const barcode = req.body.barcode;
    const image = req.files[0];

    try {
      let imageUrl = null;
      if (image) {
        const { buffer, originalname } = image;
        const timestamp = new Date().toISOString();
        const ref = `${timestamp}-${originalname}.webp`;
        // await sharp(buffer)
        //   .webp({ quality: 20 })
        //   .toFile("./uploads/" + ref);
        imageUrl = `http://localhost:3000/${ref}`;
      }

      const role = {
        connect: {
          uuid: roleUuid,
        },
      };

      const group = {
        connect: {
          uuid: groupUuid,
        },
      };

      const user = await User.create({
        data: {
          firstName,
          lastName,
          birthDate,
          role,
          group,
          barcode,
          imageUrl,
        },
        include: { role: true, group: true },
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
            allOf: [
              {
                $ref: "#/components/schemas/User",
              },
              {
                required: [
                  "firstName",
                  "lastName",
                  "birthDate",
                  "groupUuid",
                  "roleUuid",
                ],
              },
            ],
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
