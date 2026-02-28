
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Appointment = sequelize.define('appointments', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date: {
            type: DataTypes.STRING, // Storing as string for simplicity, or DATEONLY
            allowNull: false
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'New' // New, Contacted, Closed
        }
    }, {
        freezeTableName: true
    });

    return Appointment;
};
