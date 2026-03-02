/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "shopfor",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startPrice: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      endPrice: {
        type: DataTypes.REAL,
        allowNull: true,
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
      tableName: "shopfor",
      paranoid: false,
      omitNull: true,
      freezeTableName: true,
    }
  );
};
