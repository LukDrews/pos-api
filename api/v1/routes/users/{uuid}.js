module.exports = function (debug, db, Prisma, imageService) {
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
    const uuid = req.params.uuid;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const birthDate = req.body?.birthDate
      ? new Date(req.body.birthDate).toISOString()
      : undefined;
    const roleUuid = req.body.roleUuid;
    const groupUuid = req.body.groupUuid;
    const barcode = req.body.barcode;
    const file = req.files[0];

    let imagePath;

    try {
      // First get user to check for correct uuid
      let user = await db.user.findUnique({ where: { uuid } });
      if (!user) {
        throw new Error("No user found.");
      }

      const oldImagePath = user.imagePath;
      if (file) {
        imagePath = await imageService.saveAsJPEG(file?.buffer);
      }

      const role = roleUuid ? { connect: { uuid: roleUuid } } : undefined;
      const group = groupUuid ? { connect: { uuid: groupUuid } } : undefined;

      user = await db.user.update({
        where: { uuid },
        data: {
          firstName,
          lastName,
          birthDate,
          role,
          group,
          barcode,
          imagePath,
        },
        include: {
          role: true,
          group: true,
          orders: true,
          transactions: true,
        },
      });

      // Remove old image
      if (imagePath != oldImagePath) {
        try {
          await imageService.deleteImage(oldImagePath);
        } catch (error) {
          logger(error);
        }
      }

      return res.json(user);
    } catch (err) {
      logger(err);
      if (imagePath) {
        await imageService.deleteImage(imagePath);
      }
      return res.status(500).json();
    }
  }

  async function read(req, res, next) {
    const uuid = req.params.uuid;
    try {
      const user = await db.user.findUnique({
        where: { uuid },
        include: { role: true, group: true, orders: true, transactions: true },
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
      const user = await db.user.delete({
        where: { uuid },
      });
      await imageService.deleteImage(user.imagePath);

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
