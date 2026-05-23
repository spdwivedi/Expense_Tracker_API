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

// Interactive Portfolio & Developer Dashboard Root Route
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expense Tracker API Gateway</title>
        <style>
            :root {
                --bg: #0d1117;
                --card-bg: #161b22;
                --text: #c9d1d9;
                --text-muted: #8b949e;
                --accent: #58a6ff;
                --success: #2ea44f;
                --border: #30363d;
                --code-bg: #21262d;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                background-color: var(--bg);
                color: var(--text);
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }
            .container {
                max-width: 900px;
                width: 100%;
            }
            header {
                border-bottom: 1px solid var(--border);
                padding-bottom: 30px;
                margin-bottom: 35px;
            }
            .title-area {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 15px;
            }
            h1 { color: #fff; margin: 0 0 5px 0; font-size: 2.4rem; font-weight: 800; }
            .developer { color: var(--accent); font-size: 1.1rem; font-weight: 600; margin: 0 0 15px 0; }
            p { line-height: 1.6; color: var(--text-muted); font-size: 1.05rem; }
            .badge-container { margin: 15px 0; display: flex; flex-wrap: wrap; gap: 8px; }
            .badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                background: var(--card-bg);
                border: 1px solid var(--border);
                color: var(--accent);
            }
            .badge-success { color: #56d364; border-color: rgba(56,139,253,0.4); background: rgba(46,164,79,0.1); }
            .btn-group { margin-top: 25px; display: flex; gap: 15px; flex-wrap: wrap; }
            .btn {
                display: inline-flex;
                align-items: center;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                text-decoration: none;
                transition: transform 0.2s, filter 0.2s;
            }
            .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
            .btn-primary { background-color: var(--accent); color: #0d1117; }
            .btn-secondary { background-color: var(--card-bg); color: var(--text); border: 1px solid var(--border); }
            h2 { color: #fff; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-top: 45px; font-size: 1.6rem; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
            .card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                padding: 24px;
                border-radius: 8px;
            }
            .card h3 { margin: 0 0 12px 0; color: #fff; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
            .card p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
            .endpoint-list { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-top: 20px; }
            .endpoint-item { font-family: monospace; padding: 8px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
            .endpoint-item:last-child { border-bottom: none; }
            .method { padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; width: 60px; text-align: center; display: inline-block; }
            .method-post { background: rgba(46,164,79,0.2); color: #56d364; }
            .method-get { background: rgba(56,136,255,0.2); color: #58a6ff; }
            .method-put { background: rgba(216,180,254,0.2); color: #d8b4fe; }
            .method-delete { background: rgba(248,113,113,0.2); color: #f87171; }
            .path { color: #fff; font-weight: 600; margin-left: 10px; flex-grow: 1; text-align: left; }
            .scope { font-size: 0.8rem; color: var(--text-muted); }
            pre { background: var(--code-bg); padding: 16px; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto; margin-top: 15px; }
            code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9rem; color: #ff7b72; }
            .pre-comment { color: #8b949e; }
            .pre-string { color: #a5d6ff; }
            .pre-keyword { color: #ff7b72; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div class="title-area">
                    <div>
                        <h1>Expense Tracker API</h1>
                        <div class="developer">Developed by Surya Prakash Dwivedi</div>
                    </div>
                </div>
                <p>A highly performance-optimized, secure RESTful financial ledger engine. Features zero-leak multi-tenant authorization guards, user-customizable categorizations, dynamic request grouping, and sub-second relational analytics computations.</p>
                <div class="badge-container">
                    <span class="badge">TypeScript v6.0</span>
                    <span class="badge">Express v5.2</span>
                    <span class="badge">Prisma ORM</span>
                    <span class="badge">PostgreSQL Cluster</span>
                    <span class="badge badge-success">✓ Tests Passing (8/8)</span>
                </div>
                <div class="btn-group">
                    <a href="https://expense-tracker.spdwivedi.me/docs/" class="btn btn-primary">🚀 View Swagger API Documentation</a>
                    <a href="https://github.com/spdwivedi/Expense_Tracker_API" target="_blank" class="btn btn-secondary">📦 Access Source GitHub Repository</a>
                </div>
            </header>

            <h2>📦 Key Repository Assets & Verification Engines</h2>
            <div class="grid">
                <div class="card">
                    <h3>⚙️ Database Populator (prisma/seed.ts)</h3>
                    <p>Orchestrates automatic environment preparation. Seeds global system default taxonomies (Food, Transport, Bills, Health, Shopping, etc.) alongside relational testing sandboxes with single-command validation.</p>
                </div>
                <div class="card">
                    <h3>🧪 Integration Test Pipeline (src/test/api.test.ts)</h3>
                    <p>Driven by Vitest and Supertest contexts. Runs asynchronous HTTP evaluations confirming security gate functionality, parameter manipulation, and ledger multi-tenant protection layers with a <strong>100% success rate (8/8 passes)</strong>.</p>
                </div>
            </div>

            <h2>⚡ Comprehensive Endpoints Manifest</h2>
            <div class="endpoint-list">
                <div class="endpoint-item"><span class="method method-post">POST</span><span class="path">/api/v1/auth/register</span><span class="scope">Public</span></div>
                <div class="endpoint-item"><span class="method method-post">POST</span><span class="path">/api/v1/auth/login</span><span class="scope">Public</span></div>
                <div class="endpoint-item"><span class="method method-get">GET</span><span class="path">/api/v1/auth/profile</span><span class="scope">Protected</span></div>
                <div class="endpoint-item"><span class="method method-get">GET</span><span class="path">/api/v1/categories</span><span class="scope">Protected</span></div>
                <div class="endpoint-item"><span class="method method-post">POST</span><span class="path">/api/v1/transactions</span><span class="scope">Protected</span></div>
                <div class="endpoint-item"><span class="method method-get">GET</span><span class="path">/api/v1/transactions</span><span class="scope">Protected (Paginated/Sorted)</span></div>
                <div class="endpoint-item"><span class="method method-get">GET</span><span class="path">/api/v1/analytics/overview</span><span class="scope">Protected</span></div>
                <div class="endpoint-item"><span class="method method-get">GET</span><span class="path">/api/v1/analytics/category-breakdown</span><span class="scope">Protected</span></div>
            </div>

            <h2>🌐 Frontend Integration Guide</h2>
            <p>Frontend applications can seamlessly consume resources by storing the JWT token upon login and introducing it within standard outbound HTTP header configurations:</p>
            <pre><code><span class="pre-comment">// Example fetch execution implementation</span>
<span class="pre-keyword">const</span> fetchTransactions = <span class="pre-keyword">async</span> () => {
  <span class="pre-keyword">const</span> response = <span class="pre-keyword">await</span> fetch(<span class="pre-string">'https://expense-tracker.spdwivedi.me/api/v1/transactions?page=1&limit=10&sortBy=date&sortOrder=desc'</span>, {
    method: <span class="pre-string">'GET'</span>,
    headers: {
      <span class="pre-string">'Content-Type'</span>: <span class="pre-string">'application/json'</span>,
      <span class="pre-string">'Authorization'</span>: <span class="pre-string">'Bearer '</span> + localStorage.getItem(<span class="pre-string">'user_token'</span>)
    }
  });
  <span class="pre-keyword">return</span> <span class="pre-keyword">await</span> response.json();
};</code></pre>
        </div>
    </body>
    </html>
  `);
});

// App Feature Module Routing Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Interactive API UI Panel Access
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;