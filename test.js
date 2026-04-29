console.log('Test script running');
import 'dotenv/config';
console.log('Dotenv loaded');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');