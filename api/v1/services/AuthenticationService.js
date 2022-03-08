const bcrypt = require("bcrypt");
const { header } = require("express/lib/request");
const jwt = require("jsonwebtoken");

module.exports = class AuthenticationService {
  /**
   * @param {import("@prisma/client").PrismaClient} db
   * @param {import("debug").Debugger} debug
   */
  constructor(db, debug) {
    this.db = db;
    this.logger = debug.extend("authentication");
  }

  async login(username, password) {
    const userLogin = await this.db.userLogin.findUnique({
      where: { username },
    });
    if (userLogin == null) throw new Error("Login not found");

    const validPassword = await AuthenticationService.validatePassword(
      password,
      userLogin.password
    );
    if (!validPassword) throw new Error("Password is not correct");

    const accessToken = jwt.sign(
      { uuid: userLogin.userUuid },
      "my secret token" // TODO use proper secret
    );
    return accessToken;
  }

  validateToken() {
    const db = this.db
    const logger = this.logger
    return async (req, res, next) => {
      const authHeader = req?.headers?.authorization;
      if (authHeader) {
        const token = authHeader?.split(" ")?.[1];
        if (token == null) return res.status(401).send("No token found");
        
        try {
          const { uuid } = jwt.verify(token, "my secret token");
          // attach user to request
          req.user = await db.user.findUnique({ where: { uuid } });
        } catch (error) {
          logger(error)
          return res.status(403).send("Token invalid");
        }
      }
      next();
    }
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};
