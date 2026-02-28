import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Videos = sequelize.define("videos", {
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        youtubeUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        videoFile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    return Videos;
};
