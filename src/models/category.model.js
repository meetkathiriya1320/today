import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { getImageUrl } from '../helper/urlHelper.js';

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            return getImageUrl(this.getDataValue('image'));
        }
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default Category;