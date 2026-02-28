/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "metal_rates",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            rate: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00,
            },
        },
        {
            tableName: "metal_rates",
            omitNull: true,
            freezeTableName: true,
        }
    );
};
