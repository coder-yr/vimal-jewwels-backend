/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "home_gifts",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false, // e.g., "Birthday"
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            icon: {
                type: DataTypes.STRING, // Store icon name e.g., "Cake", "Gift"
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            tableName: "home_gifts",
            paranoid: true,
            omitNull: true,
            freezeTableName: true,
        }
    );
};
