import express from 'express';
import { register, login, resetPassword } from '../controllers/authController';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';
import User from '../models/User';

const router = express.Router();

// Temporary route to create admin user
router.get('/setup-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return res.status(200).json({ 
        message: 'Admin user already exists',
        email: adminEmail
      });
    }
    
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const adminUser = new User({
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed by pre-save hook
      nickname: 'Admin',
      roles: ['admin', 'user'],
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });
    
    await adminUser.save();
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
      email: adminEmail
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ 
      error: 'Failed to create admin user' 
    });
  }
});

// Validation rules for registration
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  body('nickname')
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2자 이상, 20자 이하이어야 합니다')
    .trim(),
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요'),
];

// Validation rules for password reset
const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
];

// Register new user
router.post(
  '/register',
  registerValidation,
  validateRequest,
  register
);

// Login user
router.post(
  '/login',
  loginValidation,
  validateRequest,
  login
);

// Request password reset
router.post(
  '/reset-password',
  resetPasswordValidation,
  validateRequest,
  resetPassword
);

export default router; 