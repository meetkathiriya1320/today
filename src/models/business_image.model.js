import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BusinessImage = sequelize.define('BusinessImage', {
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return process.env.APP_PROJECT_PATH + this.getDataValue('image_url');
        }
    }
}, {
    tableName: 'business_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default BusinessImage;