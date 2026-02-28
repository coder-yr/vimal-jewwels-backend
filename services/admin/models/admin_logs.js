// models/admin_logs.js
export default (sequelize, DataTypes) => {
  const AdminLog = sequelize.define("admin_logs", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    adminEmail: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    resource: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
  return AdminLog;
};
