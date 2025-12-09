import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  
  // Microservice URLs
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    queuing: process.env.QUEUING_SERVICE_URL || 'http://localhost:3002',
    interaction: process.env.INTERACTION_SERVICE_URL || 'http://localhost:3003',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
    history: process.env.HISTORY_SERVICE_URL || 'http://localhost:3007',
    communication: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3008',
    moderation: process.env.MODERATION_SERVICE_URL || 'http://localhost:3009',
  },
  
  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
};