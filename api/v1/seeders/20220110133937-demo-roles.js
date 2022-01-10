"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = ["admin", "staff", "customer"];
    await queryInterface.bulkInsert(
      "roles",
      roles.map((role) => ({
        name: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
