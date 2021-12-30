"use strict";
/**
 * //FIXME this model could be deleted.
 * The cart is only attached to the user and the user could be the cart itself.
 * No need for an extra table.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Product, CartProduct }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "user" });
      this.belongsToMany(Product, { through: CartProduct, foreignKey: "productId", as: "items" });
    }
    toJSON(){
      return {...this.get(), id: undefined, userId: undefined }
    }
  }
  Cart.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      totalAmount: DataTypes.VIRTUAL,
    },
    {
      sequelize,
      tableName: "carts",
      modelName: "Cart",
    }
  );
  return Cart;
};
