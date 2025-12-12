import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UnblockUserRequest = sequelize.define('UnblockUserRequest', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    decline_reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'unblock_user_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default UnblockUserRequest;