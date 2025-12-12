import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_super_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    iso_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

// Hash password before creating user
User.beforeCreate(async (user) => {
    if (user.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});

// Hash password before updating user
User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});

export default User;