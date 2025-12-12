import express from 'express';
import { controller } from '../../controllers/index.js';
import { uploadCategoryImage, handleMulterError } from '../../helper/upload.js';
import { authenticateToken } from '../../middleware/auth.js';


const router = express.Router();

// Create category
router.post('/', authenticateToken, uploadCategoryImage, handleMulterError, controller.createCategory);

// Get all categories
router.get('/', controller.getCategories);

// Get category by ID
router.get('/:id', controller.getCategoryById);

// Update category
router.put('/:id', authenticateToken, uploadCategoryImage, handleMulterError, controller.updateCategory);

// Delete category
router.delete('/:id', controller.deleteCategory);

export default router;
