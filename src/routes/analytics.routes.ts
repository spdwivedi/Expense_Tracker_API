import { Router } from 'express';
import { 
  getOverview, 
  getCategoryBreakdown, 
  getMonthOverMonth 
} from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware
router.use(authenticateJWT);

// Routes
router.get('/overview', getOverview);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/month-over-month', getMonthOverMonth);

export default router;