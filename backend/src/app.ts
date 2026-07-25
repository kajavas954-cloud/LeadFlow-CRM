import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cookieParser } from './middleware/cookies.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';

// Route imports
import authRouter from './routes/auth.routes.js';
import leadRouter from './routes/lead.routes.js';
import userRouter from './routes/user.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import aiRouter from './routes/ai.routes.js';

// OpenAPI Spec import
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for dev Swagger UI scripts from CDN
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isAllowedProd = origin === process.env.FRONTEND_URL;
    if (isLocalhost || isAllowedProd) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser);

// Apply general API rate limiter to all api routes
app.use('/api', apiLimiter);

// Bind routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadRouter);
app.use('/api/users', userRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Serve OpenAPI Specification JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
  const jsonPath = path.join(__dirname, 'config', 'openapi.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    res.json(JSON.parse(rawData));
  } else {
    res.status(404).json({ success: false, message: 'Specification not found' });
  }
});

// Render Swagger UI using CDN assets
app.get('/docs', (req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>LeadFlow CRM API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            deepLinking: true
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Root check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LeadFlow CRM API Server is active.',
    documentation: '/docs',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
