import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OfferView = sequelize.define('OfferView', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'offer_views',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default OfferView;