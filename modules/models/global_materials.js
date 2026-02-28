
import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "global_materials",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            category: {
                type: DataTypes.ENUM('Metal', 'Diamond', 'Gemstone', 'Other'),
                defaultValue: 'Metal',
                allowNull: false,
            },
        },
        {
            tableName: "global_materials",
            paranoid: true,
            omitNull: true,
            freezeTableName: true,
        }
    );
};
