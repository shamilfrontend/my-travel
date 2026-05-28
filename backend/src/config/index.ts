import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ppr-travel',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-jwt-refresh-secret',
  jwtExpiresIn: '1d',
  jwtRefreshExpiresIn: '7d',
};
