"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const groups = ["Group 1", "Group 2", "Group 3", "Group 4"];
    await queryInterface.bulkInsert(
      "groups",
      groups.map((group) => ({
        name: group,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("groups", null, {});
  },
};
