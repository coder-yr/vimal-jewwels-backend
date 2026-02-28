
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('product_materials', {
        productId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'products',
                key: 'id'
            },
            primaryKey: true
        },
        materialId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'materials',
                key: 'id'
            },
            primaryKey: true
        }
    }, {
        tableName: 'product_materials',
        timestamps: true // I created createdAt/updatedAt manually in raw query, so this matches
    });
};
