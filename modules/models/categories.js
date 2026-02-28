import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "categories",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      showOnHome: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      homeOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      megaCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'mega_categories',
          key: 'id',
        }
      },
    },
    {
      tableName: "categories",
      paranoid: true,
      omitNull: true,
      freezeTableName: true,
      indexes: [
        { fields: ["slug"] }
      ]
    }
  );
};
