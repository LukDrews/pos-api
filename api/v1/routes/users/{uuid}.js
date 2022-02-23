module.exports = function (debug, db, Prisma) {
  const logger = debug.extend("users");
  const User = db.user;

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
    const uuid = req.params.uuid;
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
      const user = await User.update({
        where: { uuid },
        data: {
          firstName,
          lastName,
          birthDate,
          role,
          group,
          barcode,
          imageUrl,
        },
        include: { role: true, group: true, orders: true },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await User.findUnique({
        where: { uuid },
        include: { role: true, group: true, orders: true },
      });
      return res.json(user);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  async function del(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await User.delete({
        where: { uuid },
      });
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
