"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Group, Transaction }) {
      // define association here
      this.belongsTo(Group, { foreignKey: "groupId", as: "group" });
      this.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });
    }

    toJSON() {
      return { ...this.get(), id: undefined, groupId: undefined };
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
      balance: {
        type: DataTypes.VIRTUAL,
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "customer",
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
