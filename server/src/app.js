import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env, isProduction } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';

export const app = express();

// Render runs one proxy in front of the app; trusting it lets rate limits see the real client IP.
// Only in production, so X-Forwarded-For cannot be faked to dodge limits locally.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use('/api', apiLimiter);
app.use(express.json({ limit: '10kb' }));

app.use('/api/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);
