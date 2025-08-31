const express = require('express');
const { pgPool } = require('../db');

const router = express.Router();

// Track user event
router.post('/', async (req, res) => {
  try {
    const { userId, productId, eventType } = req.body;
    
    if (!['view', 'purchase', 'cart_add', 'wishlist'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    
    const query = `
      INSERT INTO events (user_id, product_id, event_type) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const result = await pgPool.query(query, [userId, productId, eventType]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user events
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 50, eventType } = req.query;
    
    let query = `
      SELECT e.*, p.name as product_name, p.category as product_category
      FROM events e
      JOIN products p ON e.product_id = p.id
      WHERE e.user_id = $1
    `;
    
    let params = [userId];
    let paramCount = 1;
    
    if (eventType) {
      query += ` AND e.event_type = $${++paramCount}`;
      params.push(eventType);
    }
    
    query += ` ORDER BY e.timestamp DESC LIMIT $${++paramCount}`;
    params.push(parseInt(limit));
    
    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;