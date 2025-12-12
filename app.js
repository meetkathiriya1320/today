
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import sequelize from './src/config/db.js';
import db from './src/models/index.js';
import router from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Middleware
app.use(cors({ origin: "*" }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/images', express.static('public/images'));


app.use("/api/v1", router)

// Database connection and sync
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
        // Sync models with database
    })
    .then(() => {
        console.log('Models synchronized with database.');
    })
    .catch((err) => {
        console.log(err);
        console.error('Database connection/sync error:', err.message);
    });

export default app;
