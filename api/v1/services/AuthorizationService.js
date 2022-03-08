module.exports = class AuthorizationService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug) {
    this.db = db;
    this.logger = debug.extend("authorization");
  }
};
