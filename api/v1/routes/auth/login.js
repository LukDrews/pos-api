module.exports = function (debug, authenticationService) {
  const logger = debug.extend("login");

  let operations = {
    POST: login,
  };

  async function login(req, res) {
    const { username, password } = req.body;
    try {
      const accessToken = await authenticationService.login(username, password);
      return res.json({ accessToken });
    } catch (error) {
      logger(error);
      return res.sendStatus(500);
    }
  }

  login.apiDoc = {
    summary: "Login",
    description: "Log into yout account",
    operationId: "post-auth-login",
    tags: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              username: {
                type: "string",
              },
              password: {
                type: "string",
              },
            },
            required: ["username", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Logged in.",
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
