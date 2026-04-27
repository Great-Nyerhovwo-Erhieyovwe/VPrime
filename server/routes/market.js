import express from 'express';
import { getMarkets } from '../controllers/marketController.js';

const router = express.Router();

/**
 * GET /api/market
 * Returns a list of market pairs/data
 */
router.get('/', getMarkets);

export default router;
