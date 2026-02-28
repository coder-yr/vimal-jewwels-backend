
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const FooterConfig = sequelize.define('footer_configs', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        links: {
            type: DataTypes.JSON, // Stores array of { label: string, url: string }
            allowNull: true,
            defaultValue: []
        }
    }, {
        freezeTableName: true
    });

    return FooterConfig;
};
