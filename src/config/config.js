import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_MODE === 'production';

export default {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: isProduction
        ? process.env.DB_HOST              // internal Railway host
        : 'containers-us-west-123.railway.app', // local/public host
    port: Number(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    dialectOptions: {
        connectTimeout: 30000, // optional: wait 30s for DB
    }
};
