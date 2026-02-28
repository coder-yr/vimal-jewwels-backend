import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "wishlist",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "wishlist",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
      indexes: [
        { fields: ["userId"] }
      ]
    }
  );
};
