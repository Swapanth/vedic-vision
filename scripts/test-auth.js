import bcrypt from 'bcryptjs';

// Test the bcrypt hash you provided
const testPassword = async () => {
  const plainPassword = '9133603383';
  const hash = '$2a$12$haO2ahQJ7NSCRofNVsK40ONHsLgt53N3jpsJ3eB2wjOGQVSRolbba';
  
  try {
    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log('Password verification result:', isMatch);
    
    // Also test creating a new hash
    const newHash = await bcrypt.hash(plainPassword, 12);
    console.log('New hash for same password:', newHash);
    
    const newHashMatch = await bcrypt.compare(plainPassword, newHash);
    console.log('New hash verification:', newHashMatch);
    
  } catch (error) {
    console.error('Error testing password:', error);
  }
};

testPassword();