export default (sequelize, DataTypes) => {
    return sequelize.define(
        "addresses",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            addressType: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "Home",
            },
            line1: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            line2: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            landmark: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "India",
            },
            pincode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "addresses",
            timestamps: true,
        }
    );
};
