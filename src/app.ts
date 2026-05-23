import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { swaggerDocument } from './config/swagger.js';

const app: Application = express();

// Standard Production Middleware Configuration
app.use(cors());
app.use(express.json());

// HTTP Request/Response Logging Engine
app.use(morgan('dev'));

// System Core Routes
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// App Feature Module Routing Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Interactive API UI Panel Access
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;