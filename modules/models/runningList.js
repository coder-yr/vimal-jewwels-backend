/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "running_lists",
    {
      texts: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "running_lists",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
    }
  );
};
