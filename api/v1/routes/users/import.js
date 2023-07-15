// const XLSX = require("xlsx");
const moment = require("moment");
const { parse } = require("csv-parse/sync");

/**
 *
 * @param {*} debug
 * @param {import("../../services/UserService")} userService
 * @param {import("../../services/GroupService")} groupService
 * @returns
 */
module.exports = function (debug, userService, groupService, transactionService) {
  const logger = debug.extend("users");

  let operations = {
    POST: importUsers,
  };

  async function importUsers(req, res, next) {
    const file = req.files[0];

    try {
      const csvUsers = parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ";",
        cast: castDate,
      });

      const users = [];
      for (const user of csvUsers) {

        // Check if group exsists
        let group;
        if (user.group != null) {
          group = await groupService.getByName(user.group);
          if (group == null) {
            group = await groupService.create(user.group);
          }
        }

        const barcode = user.barcode || undefined;
        const generateBarcode = barcode == null;
        const result = await userService.create(
          user.firstname,
          user.lastname,
          user.birthdate,
          undefined,
          group.uuid,
          barcode,
          generateBarcode
        );
        users.push(result);

        // Check if we also have to add money to the account#
        try {
          const amount = Number.parseInt(user.amount * 100);
          if ( amount > 0 ) {
            await transactionService.create(amount, result.uuid);
          }
        } catch (error) {
          console.log("Tried to convert: " + amount)
          console.log(error);
        }
      }
      return res.json(users);
    } catch (error) {
      logger(error);
      return res.status(500).json();
    }
  }

  function castDate(value, context) {
    if (!context.header && context.column === "birthdate") {
      return moment(value, ["DD.MM.YYYY", "DD-MM-YYYY"]).toISOString();
    }
    return value;
  }

  // async function importUsersXlsx(req, res, next) {
  //   const file = req.files[0];

  //   try {
  //     const workbook = XLSX.read(file.buffer);
  //     const excelUsers = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]); // TODO try to import all workbook
  //     const users = [];
  //     for (const user of excelUsers) {
  //       const birthDate = moment(user.birthdate, [
  //         "DD.MM.YYYY",
  //         "DD-MM-YYYY",
  //       ]).toISOString();
  //       const result = await userService.create(
  //         user.firstname,
  //         user.lastname,
  //         birthDate,
  //         undefined,
  //         undefined,
  //         undefined,
  //         true
  //       );
  //       users.push(result);
  //     }
  //     return res.json(users);
  //   } catch (err) {
  //     logger(err);
  //     return res.status(500).json();
  //   }
  // }

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
