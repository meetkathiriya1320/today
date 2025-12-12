import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AdvertiseRequest = sequelize.define('AdvertiseRequest', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            return process.env.APP_PROJECT_PATH + this.getDataValue('image');
        }
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    offer_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    external_url: {
        type: DataTypes.STRING,
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
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'advertise_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default AdvertiseRequest;