const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database (in-memory for demo)
const db = new sqlite3.Database(':memory:');

// Initialize database with sample data
db.serialize(() => {
  // Create products table
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create users table
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create events table
  db.run(`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      event_type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample products
  const products = [
    ['Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop'],
    ['Smart Watch', 'Feature-rich smartwatch with health monitoring', 299.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop'],
    ['Running Shoes', 'Comfortable running shoes with extra cushioning', 89.99, 'Clothing', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop'],
    ['Coffee Maker', 'Automatic coffee maker with programmable settings', 79.99, 'Home', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop'],
    ['Yoga Mat', 'Eco-friendly yoga mat with non-slip surface', 39.99, 'Fitness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=400&fit=crop']
  ];

  const stmt = db.prepare('INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)');
  products.forEach(product => stmt.run(product));
  stmt.finalize();

  console.log('Database initialized with sample data');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all products
app.get('/api/products', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  db.all('SELECT * FROM products LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (row) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }
      
      // Hash password and create user
      const passwordHash = await bcrypt.hash(password, 10);
      
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const token = jwt.sign({ userId: this.lastID, email }, 'your_jwt_secret', { expiresIn: '24h' });
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, email }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const token = jwt.sign({ userId: user.id, email }, 'your_jwt_secret', { expiresIn: '24h' });
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track events
app.post('/api/events', (req, res) => {
  const { userId, productId, eventType } = req.body;
  
  if (!['view', 'purchase', 'cart_add', 'wishlist'].includes(eventType)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }
  
  db.run('INSERT INTO events (user_id, product_id, event_type) VALUES (?, ?, ?)', 
    [userId, productId, eventType], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: this.lastID, 
        userId, 
        productId, 
        eventType,
        timestamp: new Date().toISOString()
      });
    }
  );
});

// Simple recommendations
app.get('/api/recommendations/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Return random products as recommendations
  db.all('SELECT * FROM products ORDER BY RANDOM() LIMIT 5', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const recommendations = rows.map(product => ({
      ...product,
      personalized_recommendation: `You might like this ${product.category} product!`,
      enhanced_description: product.description
    }));
    
    res.json(recommendations);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API base: http://localhost:${PORT}/api`);
  console.log(`✅ Sample products: http://localhost:${PORT}/api/products`);
});