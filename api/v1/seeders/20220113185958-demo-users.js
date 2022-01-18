"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const firstNames = ["John", "Hans", "Peter"];
    const lastNames = ["Hansen", "Doe", "Mustermann"];
    const group = queryInterface;

    const users = [];
    for (let index = 0; index < 20; index++) {
      const user = {
        uuid: uuidv4(),
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        birthDate: "1970-01-01",
        imageLink: null,
        roleId: 2,
        groupId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
    }
    await queryInterface.bulkInsert("users", users, {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("users", null, {});
  },
};
