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
    const products = [];
    for (let index = 0; index < 20; index++) {
      const product = {
        uuid: uuidv4(),
        name: "Mars-"+uuidv4(),
        price: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      products.push(product);
    }
    await queryInterface.bulkInsert(
      "products",
      products,
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("products", null, {});
  },
};
