import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Reviews = sequelize.define("reviews", {
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        images: {
            type: DataTypes.JSON, // Stores array of image paths
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    return Reviews;
};
