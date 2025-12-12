import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OfferRequestRejectDetails = sequelize.define('OfferRequestRejectDetails', {
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'offer_request_reject_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default OfferRequestRejectDetails;