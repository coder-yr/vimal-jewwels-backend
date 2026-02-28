import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "collections",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      showOnHome: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      homeOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "collections",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
    }
  );
};
