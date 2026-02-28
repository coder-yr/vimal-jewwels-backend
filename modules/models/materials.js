/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "materials",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      tableName: "materials",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
    }
  );
};
