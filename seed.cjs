const axios = require('axios');
const { PRODUCTS } = require('./src/data/products.js');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding categories and coupons...');
    const seedResponse = await axios.post('http://localhost:3001/api/seed');
    console.log('✅ Categories and coupons seeded:', seedResponse.data.message);
    
    console.log('🌱 Seeding database with products...');
    const response = await axios.post('http://localhost:3001/api/seed-products', {
      products: PRODUCTS
    });
    
    console.log('✅ Products seeded successfully:', response.data.message);
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

seedDatabase();
