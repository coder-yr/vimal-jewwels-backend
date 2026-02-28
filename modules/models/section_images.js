/* eslint-disable import/no-anonymous-default-export */
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "section_images",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false, // e.g., "International Flair"
            },
            image: {
                type: DataTypes.STRING,
                allowNull: false,
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
            tableName: "section_images",
            paranoid: true,
            omitNull: true,
            freezeTableName: true,
        }
    );
};
