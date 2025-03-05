"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.hasMany(models.Message, {
        foreignKey: "chatId",
        as: "messages",
      });
    }
  }
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      members: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue("members");
          return rawValue
            ? Array.isArray(rawValue)
              ? rawValue
              : JSON.parse(rawValue)
            : [];
        },
        validate: {
          isValidMembersArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Members must be an array");
            }
          },
        },
      },
    },

    {
      sequelize,
      modelName: "Chat",
    }
  );
  return Chat;
};
