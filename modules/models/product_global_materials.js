
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "product_global_materials",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            productId: {
                type: DataTypes.INTEGER,
                references: {
                    model: "products",
                    key: "id",
                },
            },
            globalMaterialId: {
                type: DataTypes.INTEGER,
                references: {
                    model: "global_materials",
                    key: "id",
                },
            },
        },
        {
            tableName: "product_global_materials",
            timestamps: false, // Junction tables usually minimal
            freezeTableName: true,
        }
    );
};
