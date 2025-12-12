import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserSession = sequelize.define('UserSession', {
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expire_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default UserSession;