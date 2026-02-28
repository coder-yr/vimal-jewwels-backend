
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "inquiries",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            type: {
                type: DataTypes.STRING,
                defaultValue: 'Chat', // 'Chat' or 'Call'
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'New',
            }
        },
        {
            tableName: "inquiries",
            paranoid: true,
            omitNull: true,
            freezeTableName: true,
        }
    );
};
