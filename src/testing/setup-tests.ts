import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Загружаем .env.test только если в режиме тестов
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'test') {
  dotenv.config({ path: resolve(process.cwd(), '.env.test') });
}

console.log('🧪 Test environment loaded');
console.log('📦 NODE_ENV:', process.env.NODE_ENV);
console.log('🔗 MONGO_URL:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
