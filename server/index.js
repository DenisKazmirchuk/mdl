require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();

// In-memory storage
const users = new Map();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Helper functions
const hashPassword = async (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (users.has(email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    
    users.set(email, {
      email,
      password: hashedPassword
    });

    // Create and send token immediately after registration
    const token = jwt.sign(
      { email: email }, 
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ message: 'Registration successful! Logging you in...' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || user.password !== await hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email }, 
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    const user = users.get(decoded.email);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 