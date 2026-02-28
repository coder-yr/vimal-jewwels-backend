/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "pages",
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            content: {
                type: DataTypes.TEXT("long"),
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "pages",
            paranoid: true,
            omitNull: true,
            freezeTableName: true,
        }
    );
};
