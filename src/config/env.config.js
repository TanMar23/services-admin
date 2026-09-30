import dotenv from 'dotenv';

dotenv.config();

const envConfig = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGODB_URI,
};

if (!envConfig.nodeEnv) {
  console.error('Missing mandatory environment variable: NODE_ENV');
  process.exit(1);
}

if (!envConfig.mongoUri) {
  console.error('Missing mandatory environment variable: MONGODB_URI');
  process.exit(1);
}

export default envConfig;
