import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { hashPassword, comparePassword, generateSessionToken, getSessionExpiration } from '../utils/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Signup endpoint
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = getSessionExpiration(7); // 7 days

    await pool.query(
      'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      sessionToken: sessionToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});

// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = getSessionExpiration(7); // 7 days

    await pool.query(
      'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      sessionToken: sessionToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const sessionToken = req.user.sessionToken;

    // Delete session from database
    await pool.query(
      'DELETE FROM sessions WHERE session_token = $1',
      [sessionToken]
    );

    // Clear cookie
    res.clearCookie('session_token');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user information' 
    });
  }
});

// Verify session endpoint (optional - for checking if session is valid)
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: 'Session is valid',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export default router;

