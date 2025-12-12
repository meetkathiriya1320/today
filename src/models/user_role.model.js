import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserRole = sequelize.define('UserRole', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otp_expiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_verify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

// Hash password before creating user role
UserRole.beforeCreate(async (userRole) => {
    if (userRole.password) {
        const bcrypt = await import('bcrypt');
        const saltRounds = 10;
        userRole.password = await bcrypt.default.hash(userRole.password, saltRounds);
    }
});

// Hash password before updating user role
UserRole.beforeUpdate(async (userRole) => {
    if (userRole.changed('password')) {
        const bcrypt = await import('bcrypt');
        const saltRounds = 10;
        userRole.password = await bcrypt.default.hash(userRole.password, saltRounds);
    }
});

export default UserRole;