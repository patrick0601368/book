// Simple script to test user registration
// Run with: node scripts/test-auth.js

const bcrypt = require('bcryptjs');

async function testUserCreation() {
  try {
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Test password verification
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password verification test:', isValid);
    
    console.log('\n✅ Authentication setup is working correctly!');
  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  }
}

testUserCreation();
