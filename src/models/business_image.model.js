import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { getImageUrl } from '../helper/urlHelper.js';

const BusinessImage = sequelize.define('BusinessImage', {
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return getImageUrl(this.getDataValue('image_url'));
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