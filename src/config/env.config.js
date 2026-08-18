import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
};

if (!config.port) {
  console.error('Missing mandatory environment variable: PORT');
  process.exit(1);
}

if (!config.nodeEnv) {
  console.error('Missing mandatory environment variable: NODE_ENV');
  process.exit(1);
}

export default config;
