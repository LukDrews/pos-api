const XLSX = require("xlsx");
const moment = require("moment");

/**
 * 
 * @param {*} debug 
 * @param {import("../services/UserService")} userService 
 * @returns 
 */
module.exports = function (debug, userService) {
  const logger = debug.extend("users");

  let operations = {
    POST: importUsers,
  };

  async function importUsers(req, res, next) {
    const file = req.files[0];

    try {
      const workbook = XLSX.read(file.buffer);
      const excelUsers = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);
      const users = [];
      for (const user of excelUsers) {
        const birthDate = moment(user.birthdate, [
          "DD.MM.YYYY",
          "DD-MM-YYYY",
        ]).toISOString();
        const result = await userService.create(
          user.firstname,
          user.lastname,
          birthDate,
          undefined,
          undefined,
          undefined,
          true
        );
        users.push(result);
      }
      return res.json(users);
    } catch (err) {
      logger(err);
      return res.status(500).json();
    }
  }

  importUsers.apiDoc = {
    summary: "Import users",
    description: "Import new users",
    operationId: "post-users-import",
    tags: [],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            properties: {
              file: {
                type: "string",
              },
            },
            required: ["file"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Users were imported",
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
