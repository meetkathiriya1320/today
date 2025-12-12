import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Debug logging for environment variables
console.log('Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_PASS:', process.env.DB_PASS ? '***' : 'undefined');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false,
        port: process.env.DB_PORT || 5432,
        // Additional Sequelize v4+ options
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
);

export default sequelize;
