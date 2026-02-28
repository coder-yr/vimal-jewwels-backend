
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Settings = sequelize.define('settings', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "+91 22 61066262"
        },
        contactTiming: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "(9am-7pm, 6 days a week)"
        },
        supportEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "support@VIMALJEWELLERS.com"
        },
        facebookLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        instagramLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        twitterLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        youtubeLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pinterestLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        whatsappLink: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        freezeTableName: true
    });

    return Settings;
};
