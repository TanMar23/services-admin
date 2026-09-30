import mongoose from 'mongoose';
import envConfig from './env.config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
