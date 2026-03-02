/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "styles",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      megaCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mega_categories",
          key: "id",
        },
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "styles",
      paranoid: false,
      omitNull: true,
      freezeTableName: true,
    }
  );
};
