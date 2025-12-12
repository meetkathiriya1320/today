import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Payment = sequelize.define('Payment', {
    payment_method: {
        type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'online'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    check_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'advertise_banners',
            key: 'id'
        }
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    create_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default Payment;