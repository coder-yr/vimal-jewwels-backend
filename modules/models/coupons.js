import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "coupons",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            discountType: {
                type: DataTypes.ENUM("FLAT", "PERCENTAGE"),
                defaultValue: "FLAT",
                allowNull: false,
            },
            discountValue: {
                type: DataTypes.REAL,
                allowNull: false,
            },
            minOrderValue: {
                type: DataTypes.REAL,
                defaultValue: 0,
            },
            expiryDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "coupons",
            paranoid: true, // Enables soft deletes
            freezeTableName: true,
        }
    );
};
