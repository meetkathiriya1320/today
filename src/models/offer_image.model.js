import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { getImageUrl } from '../helper/urlHelper.js';

const OfferImage = sequelize.define('OfferImage', {
    image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return getImageUrl(this.getDataValue('image'));
        }
    },
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'offer_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default OfferImage;