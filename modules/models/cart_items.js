import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "cart_items",
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
            variantMetalId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            variantDiamondId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            ringSize: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            customEngraving: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "cart_items",
            paranoid: true, // Enables soft deletes (deletedAt)
            omitNull: true,
            freezeTableName: true,
        }
    );
};
