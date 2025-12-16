import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RESPONSE } from './response.js';

// Create public/images directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9]/g, '_') // Replace special characters and spaces with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
            .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores
        cb(null, basename + '-' + uniqueSuffix + extension);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Single file upload for category image
export const uploadCategoryImage = upload.single('image');

// Single file upload for brand image
export const uploadBrandImage = upload.single('image');

// Single file upload for banner image
export const uploadBannerImage = upload.single('image');

// Single file upload for offer banner image
export const uploadOfferBanner = upload.single('banner_image');

// Single file upload for content management image
export const uploadSingle = upload.single('image');

// Multiple files upload (if needed in future)
export const uploadMultiple = upload.array('images', 10);

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return RESPONSE.error(res, 2023, 400);
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return RESPONSE.error(res, 2024, 400);
        }
    }

    if (error.message === 'Only image files are allowed!') {
        return RESPONSE.error(res, 2025, 400);
    }

    next(error);
};