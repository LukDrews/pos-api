"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CartProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    toJSON() {
      
    }
  }
  CartProduct.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Product,
          key: "id",
        },
      },
      cartId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Cart,
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "cartProducts",
      modelName: "CartProduct",
    }
  );
  return CartProduct;
};
