module.exports = class UserService {
  constructor(db, debug, imageService) {
    this.db = db;
    this.logger = debug.extend("users");
    this.imageService = imageService;
  }

  async create(
    firstName,
    lastName,
    birthDate,
    roleUuid,
    groupUuid,
    barcode = undefined,
    file = undefined
  ) {
    let imagePath;

    try {
      imagePath = await this.imageService.saveAsJPEG(file?.buffer);

      const user = await this.db.user.create({
        data: {
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
          imagePath,
        },
        include: { role: true, group: true },
      });
      return user;
    } catch (err) {
      logger(err);
      // If user creation did not succeed, delete image
      if (imagePath) {
        await this.imageService.deleteImage(imagePath);
      }
      throw err;
    }
  }

  async update(
    uuid,
    firstName,
    lastName,
    birthDate,
    roleUuid,
    groupUuid,
    barcode = undefined,
    file = undefined
  ) {
    let imagePath;

    try {
      // First get user to check for correct uuid
      let user = await this.db.user.findUnique({ where: { uuid } });
      if (!user) {
        throw new Error("No user found.");
      }

      const oldImagePath = user.imagePath;
      if (file) {
        imagePath = await this.imageService.saveAsJPEG(file?.buffer);
      }

      const role = roleUuid ? { connect: { uuid: roleUuid } } : undefined;
      const group = groupUuid ? { connect: { uuid: groupUuid } } : undefined;

      user = await this.db.user.update({
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
          await this.imageService.deleteImage(oldImagePath);
        } catch (error) {
          this.logger(error);
        }
      }

      return user;
    } catch (err) {
      this.logger(err);
      if (imagePath) {
        await this.imageService.deleteImage(imagePath);
      }
      throw err;
    }
  }

  async getAll() {
    const users = await this.db.user.findMany({
      include: {
        group: {
          select: {
            uuid: true,
          },
        },
        role: {
          select: {
            uuid: true,
          },
        },
      },
    });
    return users;
  }

  async getByUuid(uuid) {
    const user = await this.db.user.findUnique({
      where: { uuid },
      include: { role: true, group: true, orders: true, transactions: true },
    });
    return user;
  }

  async getByBarcode(barcode) {
    const user = await this.db.user.findUnique({
      where: { barcode },
    });
  }

  async delete(uuid) {
    try {
      // FIXME this should be done with a transaction
      const balance = (await this.db.user.findUnique({ where: { uuid } })).balance;

      if (balance !== 0)
        throw Error("Account can't be deleted. Cause: account balance not 0.");

      const user = await this.db.user.delete({
        where: { uuid },
      });
      await this.imageService.deleteImage(user.imagePath);

      return user;
    } catch (err) {
      this.logger(err);
      throw err;
    }
  }
};
