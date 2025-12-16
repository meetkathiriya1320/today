import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const NotificationUser = sequelize.define('NotificationUser', {
    notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notifications',
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
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    redirect_url: {
        type: DataTypes.STRING,

    }
}, {
    tableName: 'notification_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default NotificationUser;