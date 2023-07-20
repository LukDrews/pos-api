const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = "my secret token"; // TODO create secret in convict config

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
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30d"
      }
    );
    return accessToken;
  }

  validateToken() {
    const db = this.db;
    const logger = this.logger;
    return async (req, res, next) => {
      const authHeader = req?.headers?.authorization;
      if (!authHeader) return next(); // continue with no user

      const token = authHeader?.split(" ")?.[1];
      if (token == null) return res.status(401).send("No token found");

      try {
        const { uuid } = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (!uuid) throw new Error();

        // inject user into request
        req.user = await db.user.findUnique({ where: { uuid } });
        next();
      } catch (error) {
        logger(error);
        return res.status(403).send("Token invalid");
      }
    };
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};
