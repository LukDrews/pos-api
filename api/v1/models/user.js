"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Group, Order, Role }) {
      // define association here
      this.belongsTo(Group, { foreignKey: "groupId", as: "group" });
      this.hasMany(Order, { foreignKey: "userId", as: "orders" });
      this.belongsTo(Role, { foreignKey: "roleId", as: "role" });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        groupId: undefined,
        roleId: undefined,
      };
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
