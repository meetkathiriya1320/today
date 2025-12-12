import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OfferReport = sequelize.define('OfferReport', {
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'offers',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,

    }

}, {
    tableName: 'offer_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default OfferReport;