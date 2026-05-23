import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout 
} from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Rate limiting rule: Max 15 authentication attempts per 15 minutes per unique IP address
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, 
  message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public (Rate Limited to prevent brute force)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, changePassword);
router.post('/logout', authenticateJWT, logout);

export default router;