import path from 'path';
import fs from 'fs';
import { RESPONSE } from '../../helper/response.js';

// Helper function to get correct image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If imagePath already contains full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If imagePath starts with /images/, just prepend the base URL
    if (imagePath.startsWith('/images/')) {
        return `${process.env.APP_PROJECT_PATH}${imagePath}`;
    }

    // If imagePath is just filename, construct full path
    if (!imagePath.startsWith('/')) {
        return `${process.env.APP_PROJECT_PATH}/images/${imagePath}`;
    }

    return `${process.env.APP_PROJECT_PATH}${imagePath}`;
};

// Helper function to append base URL to object with image
export const appendBaseUrl = (obj) => {
    if (!obj) return obj;

    const result = { ...obj };

    // Handle direct image property
    if (result.image) {
        result.image = getImageUrl(result.image);
    }

    // Handle nested OfferImage
    if (result.OfferImage && result.OfferImage.image) {
        result.OfferImage.image = getImageUrl(result.OfferImage.image);
    }

    // Handle array of objects with images
    if (Array.isArray(result)) {
        return result.map(item => appendBaseUrl(item));
    }

    return result;
};

// Serve image file directly
export const serveImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(process.cwd(), 'public', 'images', filename);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return RESPONSE.error(res, 404, 404, 'Image not found');
        }

        // Get file extension to set correct content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = contentTypes[ext] || 'image/jpeg';

        // Set headers for image serving
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Send the file
        res.sendFile(imagePath);
    } catch (error) {
        return RESPONSE.error(res, 2999, 500, error);
    }
};