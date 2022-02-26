const { v4 } = require("uuid");

module.exports = function (debug, db, imageService) {
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
    const file = req.files[0];

    let imageUrl;

    try {
      const uuid = v4();
      const filename = `${firstName}_${lastName}_${uuid}`;
      imageUrl = await imageService.saveAsJPEG(file?.buffer, filename);

      const user = await User.create({
        data: {
          uuid,
          firstName,
          lastName,
          birthDate,
          role: {
            connect: {
              uuid: roleUuid,
            },
          },
          group: {
            connect: {
              uuid: groupUuid,
            },
          },
          barcode,
          imageUrl,
        },
        include: { role: true, group: true },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      // If user creation did not succeed, delete image
      if (imageUrl) {
        await imageService.deleteImage(imageUrl);
      }
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
