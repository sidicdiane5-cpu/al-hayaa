// Script pour initialiser la base de données avec les produits existants
import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PRODUCTS } = require('./src/data/products.js');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with products...');
    
    const response = await axios.post('http://localhost:3001/api/seed-products', {
      products: PRODUCTS
    });
    
    console.log('✅ Products seeded successfully:', response.data.message);
    
    // Seed categories and coupons
    console.log('🌱 Seeding categories and coupons...');
    const seedResponse = await axios.post('http://localhost:3001/api/seed');
    console.log('✅ Categories and coupons seeded:', seedResponse.data.message);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

// Start the server first, then seed
import { spawn } from 'child_process';

console.log('🚀 Starting server...');
const server = spawn('node', ['server.js'], { 
  cwd: process.cwd(),
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Wait for server to start, then seed
setTimeout(() => {
  seedDatabase();
}, 2000);
