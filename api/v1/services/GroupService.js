module.exports = class GroupService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug) {
    this.db = db;
    this.logger = debug.extend("groups");
  }

  async create(name, users = []) {
    const group = await this.db.group.create({ data: { name } });
    if (users.length > 0) {
      // Todo add members to group
    }
    return group;
  }

  async getAll() {
    const groups = await this.db.group.findMany();
    return groups;
  }

  async getByUuid(uuid) {
    const group = await this.db.group.findUnique({
      where: { uuid },
    });
    return group;
  }

  async getByName(name) {
    const group = await this.db.group.findUnique({
      where: { name },
    });
    return group;
  }
};
