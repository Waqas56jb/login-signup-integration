import pool from '../config/database.js';

// Middleware to verify session token
export const authenticateToken = async (req, res, next) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                        req.cookies?.session_token;

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }

    // Check if session exists and is valid
    const sessionQuery = `
      SELECT s.*, u.id, u.name, u.email, u.created_at as user_created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
    `;

    const result = await pool.query(sessionQuery, [sessionToken]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session. Please login again.' 
      });
    }

    // Attach user info to request
    req.user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      sessionToken: sessionToken,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

