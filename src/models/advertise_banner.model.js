import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AdvertiseBanner = sequelize.define('AdvertiseBanner', {
    request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'advertise_requests',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'pending'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    create_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'advertise_banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default AdvertiseBanner;