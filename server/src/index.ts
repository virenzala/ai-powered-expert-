import express from 'express';
import { seedInline } from './seed/seedRunner';
import { User } from './models/User';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import leadRoutes from './routes/lead.routes';
import companyRoutes from './routes/company.routes';
import importRoutes from './routes/import.routes';
import templateRoutes from './routes/template.routes';
import campaignRoutes from './routes/campaign.routes';
import gmailRoutes from './routes/gmail.routes';
import followupRoutes from './routes/followup.routes';
import suppressionRoutes from './routes/suppression.routes';
import reportsRoutes from './routes/reports.routes';
import auditRoutes from './routes/audit.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import discoveryRoutes from './routes/discovery.routes';
import userRoutes from './routes/user.routes';
import industrialRoutes from './routes/industrial.routes';

const app = express();

// Enable CORS & JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    application: 'ExportFlow AI Outreach Server',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/buyer-discovery', discoveryRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/import', importRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/suppression', suppressionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activity', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/industrial', industrialRoutes);

// Centralized error handler
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is empty (e.g. fresh MongoMemoryServer boot)
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    logger.info('Database empty. Auto-seeding initial B2B export dataset...');
    await seedInline();
  }

  const PORT = parseInt(env.PORT, 10) || 5000;
  app.listen(PORT, () => {
    logger.info(`🚀 ExportFlow API Server running on port ${PORT} [env: ${env.NODE_ENV}]`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
