import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserBlockHistory = sequelize.define('UserBlockHistory', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    blocked_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason_for_block: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('blocked', 'unblocked'),
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'user_block_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default UserBlockHistory;