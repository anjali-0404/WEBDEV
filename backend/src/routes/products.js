const express = require('express');
const { pgPool } = require('../db');
const cache = require('../cache');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category } = req.query;
    
    let query = 'SELECT * FROM products';
    let params = [];
    let paramCount = 0;
    
    if (category) {
      query += ` WHERE category = $${++paramCount}`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check cache first
    const cacheKey = cache.getProductKey(productId);
    const cachedProduct = await cache.get(cacheKey);
    
    if (cachedProduct) {
      return res.json(cachedProduct);
    }
    
    // If not in cache, query database
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pgPool.query(query, [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = result.rows[0];
    
    // Cache the product
    await cache.set(cacheKey, product);
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;