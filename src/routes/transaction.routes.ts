import { Router } from 'express';
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById,
  updateTransaction, 
  deleteTransaction 
} from '../controllers/transaction.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware
router.use(authenticateJWT);

// Routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;