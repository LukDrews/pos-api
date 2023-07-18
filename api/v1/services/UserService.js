const { barcode } = require("../../../libs/validators");
const BARCODE_PREFIX = "952";

module.exports = class UserService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug, imageService) {
    this.db = db;
    this.logger = debug.extend("users");
    this.imageService = imageService;
  }

  /**
   * 
   * @param {*} firstName 
   * @param {*} lastName 
   * @param {*} birthDate 
   * @param {*} roleUuid 
   * @param {*} groupUuid 
   * @param {*} barcode 
   * @param {*} generateBarcode 
   * @param {*} file 
   * @returns 
   */
  async create(
    firstName,
    lastName,
    birthDate,
    roleUuid,
    groupUuid,
    barcode = undefined,
    generateBarcode = undefined,
    file = undefined
  ) {
    let imagePath;
    try {
      if (generateBarcode && barcode == null) {
        barcode = await this.generateUserBarcode();
      }

      imagePath = await this.imageService.saveAsJPEG(file?.buffer);

      const role = roleUuid ? { connect: { uuid: roleUuid } } : undefined;
      const group = groupUuid ? { connect: { uuid: groupUuid } } : undefined;

      const user = await this.db.user.create({
        data: {
          firstName,
          lastName,
          birthDate,
          role,
          group,
          barcode,
          imagePath,
        },
        include: { role: true, group: true },
      });
      return user;
    } catch (err) {
      this.logger(err);
      // If user creation did not succeed, delete image
      if (imagePath) {
        await this.imageService.deleteImage(imagePath);
      }
      throw err;
    }
  }

  async generateUserBarcode() {
    const user = await this.db.user.findFirst({
      orderBy: {
        barcode: "desc",
      },
      select: { barcode: true },
    });

    let index = 0;
    if (user?.barcode) {
      const substring = user.barcode.substring(3, 7);
      index = Number.parseInt(substring) + 1;
    }
    let userBarcode = BARCODE_PREFIX + index.toString().padStart(4, "0");
    userBarcode += barcode.getChecksum(userBarcode + "0");
    return userBarcode;
  }

  async update(
    uuid,
    firstName,
    lastName,
    birthDate,
    roleUuid,
    groupUuid,
    barcode = undefined,
    generateBarcode = undefined,
    file = undefined
  ) {
    let imagePath;

    try {
      // First get user to check for correct uuid
      let user = await this.db.user.findUnique({ where: { uuid } });
      if (!user) {
        throw new Error("No user found.");
      }

      if (generateBarcode && barcode == null) {
        barcode = await this.generateUserBarcode();
      }

      const oldImagePath = user.imagePath;
      if (file) {
        imagePath = await this.imageService.saveAsJPEG(file?.buffer);
      }

      const role = roleUuid !== "null" ? { connect: { uuid: roleUuid } } : undefined;
      const group = groupUuid !== "null" ? { connect: { uuid: groupUuid } } : undefined;

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
    const users = await this.db.user.findMany();
    return users;
  }

  async getByUuid(uuid) {
    const user = await this.db.user.findUnique({
      where: { uuid },
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
      return await this.db.$transaction(async (tx) => {
        // FIXME this should be done with a transaction
        const user = await tx.user.findUnique({
          where: { uuid },
          include: {
            orders: { include: { items: true } },
            transactions: true,
            login: { select: { username: true } },
          },
        });

        if (user.balance !== 0)
          throw Error(
            "Account can't be deleted. Cause: account balance not 0."
          );

        for (const order of user.orders) {
          await tx.orderItem.deleteMany({ where: { orderUuid: order.uuid } });
          await tx.order.delete({ where: { uuid: order.uuid } });
        }

        await tx.transaction.deleteMany({ where: { userUuid: user.uuid } });

        if (user.login) {
          await tx.userLogin.delete({ where: { userUuid: user.uuid } });
        }

        await tx.user.delete({
          where: { uuid },
        });
        await this.imageService.deleteImage(user.imagePath);

        return user;
      });
    } catch (err) {
      this.logger(err);
      throw err;
    }
  }
};
