import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from '../utils/logger';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const timeout = process.env.VERCEL ? 1500 : 3000;
    logger.info(`Attempting MongoDB connection to ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: timeout,
    });
    logger.info('Connected successfully to external/local MongoDB.');
  } catch (error: any) {
    logger.warn(`Could not connect to ${env.MONGODB_URI} (${error.message}). Launching embedded MongoMemoryServer...`);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create(
          process.env.VERCEL ? { binary: { downloadDir: '/tmp/mongodb' } } : undefined
        );
      }
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      logger.info(`Connected successfully to embedded MongoMemoryServer at ${memoryUri}`);
    } catch (memError: any) {
      logger.error('Failed to initialize MongoMemoryServer:', memError);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
