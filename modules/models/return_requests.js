import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "return_requests",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            comments: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            images: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: []
            },
            status: {
                type: DataTypes.ENUM(
                    "Pending",
                    "Under Review",
                    "Approved",
                    "Rejected",
                    "Item Received",
                    "Refund Processed"
                ),
                defaultValue: "Pending",
            },
        },
        {
            tableName: "return_requests",
            paranoid: true,
            timestamps: true,
            indexes: [
                { fields: ["orderId"] },
                { fields: ["userId"] },
                { fields: ["status"] },
            ]
        }
    );
};
