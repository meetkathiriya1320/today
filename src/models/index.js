import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

// Import models here as you create them
import User from './user.model.js';
import UserSession from './user_session.model.js';
import Business from './business.model.js';
import Notification from './notification.model.js';
import Offer from './offers.model.js';
import OfferImage from './offer_image.model.js';
import Category from './category.model.js';
import ContactUs from './contact_us.model.js';
import HomeBanner from './home_banners.model.js';
import UnblockUserRequest from './unblock_user_request.model.js';
import OfferView from './offer_view.model.js';
import OfferRequestRejectDetails from './offer_request_reject_details.model.js';
import Branches from './branches.model.js';
import OfferReport from './offer_report.model.js';
import BusinessImage from './business_image.model.js';
import AdvertiseRequest from './advertise_request.model.js';
import AdvertiseBanner from './advertise_banner.model.js';
import Payment from './payment.model.js';
import Settings from './settings.model.js';
import UserBlockHistory from './userBlockHistory.model.js';
import Role from './role.model.js';
import UserRole from './user_role.model.js';
import NotificationRole from './notification_role.model.js';
import NotificationUser from './notification_user.model.js';

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Add models to db object
db.User = User;
db.UserSession = UserSession;
db.Business = Business;
db.Notification = Notification;
db.Offer = Offer;
db.OfferImage = OfferImage;
db.Category = Category;
db.ContactUs = ContactUs;
db.HomeBanner = HomeBanner;
db.UnblockUserRequest = UnblockUserRequest;
db.OfferView = OfferView;
db.OfferRequestRejectDetails = OfferRequestRejectDetails;
db.Branches = Branches;
db.OfferReport = OfferReport;
db.BusinessImage = BusinessImage;
db.AdvertiseRequest = AdvertiseRequest;
db.AdvertiseBanner = AdvertiseBanner;
db.Payment = Payment;
db.Setting = Settings;
db.UserBlockHistory = UserBlockHistory;
db.Role = Role;
db.UserRole = UserRole;
db.NotificationRole = NotificationRole;
db.NotificationUser = NotificationUser;


// Define associations
// db.User.hasMany(db.UserSession, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasOne(db.Business, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasMany(db.Offer, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasMany(db.UnblockUserRequest, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasMany(db.OfferView, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasOne(db.UserBlockHistory, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// UserSession associations
// db.UserSession.belongsTo(db.User, { foreignKey: 'user_id' });
db.UserRole.hasHooks(db.UserSession, { foreignKey: 'user_role_id', onDelete: 'CASCADE' })
db.UserSession.belongsTo(db.UserRole, { foreignKey: 'user_role_id' })



// Business associations
db.Business.belongsTo(db.User, { foreignKey: 'user_id' });
db.Branches.hasMany(db.Offer, { foreignKey: 'branch_id', onDelete: 'CASCADE' });
db.Business.hasMany(db.Branches, { as: "branches", foreignKey: 'business_id', onDelete: 'CASCADE' });
db.Business.hasMany(db.BusinessImage, { as: "business_images", foreignKey: 'business_id', onDelete: 'CASCADE' });

// Notification associations
db.Notification.belongsTo(db.User, { foreignKey: 'send_by', as: 'sender' });
db.Notification.hasMany(db.NotificationRole, { foreignKey: 'notification_id', onDelete: 'CASCADE' });
db.Notification.hasMany(db.NotificationUser, { foreignKey: 'notification_id', onDelete: 'CASCADE' });

// NotificationRole associations
db.NotificationRole.belongsTo(db.Notification, { foreignKey: 'notification_id' });
db.NotificationRole.belongsTo(db.Role, { foreignKey: 'role_id' });

// NotificationUser associations
db.NotificationUser.belongsTo(db.Notification, { foreignKey: 'notification_id' });
db.NotificationUser.belongsTo(db.User, { foreignKey: 'user_id' });

// Offer associations
db.Offer.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Offer.belongsTo(db.Branches, { foreignKey: 'branch_id' });
db.Offer.belongsTo(db.User, { foreignKey: 'user_id' });
db.Offer.hasOne(db.OfferImage, { foreignKey: 'offer_id', onDelete: 'CASCADE' });
db.Offer.hasMany(db.OfferView, { foreignKey: 'offer_id', onDelete: 'CASCADE' });
db.Offer.hasMany(db.OfferRequestRejectDetails, { foreignKey: 'offer_id', onDelete: 'CASCADE' });

// OfferImage associations
db.OfferImage.belongsTo(db.Offer, { foreignKey: 'offer_id' });

// Category associations
db.Category.hasMany(db.Offer, { foreignKey: 'category_id', onDelete: 'CASCADE' });

// UnblockUserRequest associations
db.UnblockUserRequest.belongsTo(db.User, { foreignKey: 'user_id' });

// UserBlockHistory associations
db.UserBlockHistory.belongsTo(db.User, { foreignKey: 'user_id' });


// OfferView associations
db.OfferView.belongsTo(db.User, { foreignKey: 'user_id' });
db.OfferView.belongsTo(db.Offer, { foreignKey: 'offer_id' });

// OfferRequestRejectDetails associations
db.OfferRequestRejectDetails.belongsTo(db.Offer, { foreignKey: 'offer_id' });
db.OfferRequestRejectDetails.belongsTo(db.User, { foreignKey: 'rejected_by', as: 'rejector' });

// OfferReport associations
db.OfferReport.belongsTo(db.Offer, { foreignKey: 'offer_id' });
db.OfferReport.belongsTo(db.User, { foreignKey: 'user_id' });


// Reverse relations
db.Offer.hasMany(db.OfferReport, {
    foreignKey: 'offer_id',
    onDelete: 'CASCADE'
});

db.User.hasMany(db.OfferReport, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});


// Branches associations
db.Branches.belongsTo(db.Business, { foreignKey: 'business_id' });

// BusinessImage associations
db.BusinessImage.belongsTo(db.Business, { foreignKey: 'business_id' });

// AdvertiseRequest associations
db.AdvertiseRequest.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasMany(db.AdvertiseRequest, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// AdvertiseBanner associations
db.AdvertiseBanner.belongsTo(db.AdvertiseRequest, { foreignKey: 'request_id' });
db.AdvertiseRequest.hasOne(db.AdvertiseBanner, { foreignKey: 'request_id', onDelete: 'CASCADE' });

// Payment associations
db.Payment.belongsTo(db.AdvertiseBanner, { foreignKey: 'ad_id' });
db.AdvertiseBanner.hasMany(db.Payment, { foreignKey: 'ad_id', onDelete: 'CASCADE' });

// Role associations
db.Role.belongsToMany(db.User, { through: db.UserRole, foreignKey: 'role_id', otherKey: 'user_id' });

// UserRole associations
db.UserRole.belongsTo(db.User, { foreignKey: 'user_id' });
db.UserRole.belongsTo(db.Role, { foreignKey: 'role_id' });

// User associations with roles
db.User.belongsToMany(db.Role, { through: db.UserRole, foreignKey: 'user_id', otherKey: 'role_id' });
db.User.hasMany(db.UserRole, { foreignKey: 'user_id' });

// Define associations here if needed
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

export default db;