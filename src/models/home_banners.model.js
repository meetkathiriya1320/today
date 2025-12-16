import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { getImageUrl } from '../helper/urlHelper.js';

const HomeBanner = sequelize.define('HomeBanner', {
    image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return getImageUrl(this.getDataValue('image'));
        }
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    redirect_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'home_banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default HomeBanner;