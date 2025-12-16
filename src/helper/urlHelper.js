/**
 * Centralized URL helper function to construct proper image URLs
 * Prevents double-prepending of APP_PROJECT_PATH
 */

const getImageUrl = (imagePath) => {
    // Return null if no image path
    if (!imagePath) {
        return null;
    }

    // Get base URL from environment
    const baseUrl = process.env.APP_PROJECT_PATH || 'http://localhost:4000';

    // Remove leading slash from image path to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Check if imagePath already contains the base URL
    if (imagePath.startsWith(baseUrl)) {
        return imagePath;
    }

    // Construct full URL (Express static handles encoding automatically)
    return `${baseUrl}/${cleanPath}`;
};

const appendBaseUrl = (obj, imageField = 'image') => {
    if (obj && obj[imageField]) {
        obj[imageField] = getImageUrl(obj[imageField]);
    }
    return obj;
};

const appendBaseUrlToOfferImages = (obj) => {
    if (obj && obj.OfferImage) {
        if (obj.OfferImage.image) {
            obj.OfferImage.image = getImageUrl(obj.OfferImage.image);
        }
    }
    return obj;
};

export { getImageUrl, appendBaseUrl, appendBaseUrlToOfferImages };