import { body, validationResult } from 'express-validator';

// Test what normalizeEmail does to the email
const testEmail = 'meghana.madala2006@gmail.com';

console.log('Original email:', testEmail);

// Simulate what express-validator normalizeEmail does
// Common normalizations:
// 1. Convert to lowercase
// 2. Remove dots from Gmail addresses
// 3. Remove + aliases

const normalizedEmail1 = testEmail.toLowerCase();
console.log('Lowercase:', normalizedEmail1);

const normalizedEmail2 = testEmail.toLowerCase().replace(/\./g, '');
console.log('Remove all dots:', normalizedEmail2);

// Gmail specific normalization (remove dots before @)
const [localPart, domain] = testEmail.split('@');
const normalizedLocal = localPart.replace(/\./g, '');
const normalizedEmail3 = `${normalizedLocal}@${domain}`.toLowerCase();
console.log('Gmail normalized (dots removed from local part):', normalizedEmail3);

// Test with express-validator directly
const mockReq = {
  body: {
    email: testEmail,
    password: '9390189530'
  }
};

const mockRes = {
  status: () => mockRes,
  json: (data) => {
    console.log('Validation response:', data);
    return mockRes;
  }
};

const mockNext = () => {
  console.log('Validation passed, email in body:', mockReq.body.email);
};

// Create validation chain
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Run validation
const runValidation = async () => {
  console.log('\n--- Running express-validator test ---');
  
  // Apply validation rules
  for (const validation of validateLogin) {
    await validation.run(mockReq);
  }
  
  // Check results
  const errors = validationResult(mockReq);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
  } else {
    console.log('Validation passed');
    console.log('Email after normalization:', mockReq.body.email);
  }
};

runValidation();