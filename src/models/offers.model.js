import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Offer = sequelize.define('Offer', {
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    offer_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    short_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    full_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'rejected', 'approved'),
        defaultValue: 'pending'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    blocked_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default Offer;