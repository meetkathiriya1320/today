import express from 'express';
import { serveImage } from '../../controllers/images/serveImage.js';

const router = express.Router();

// Serve images directly
router.get('/:filename', serveImage);

export default router;