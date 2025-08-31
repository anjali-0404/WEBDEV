const express = require('express');
const { pgPool } = require('../db');
const ranker = require('../ranker');
const bandit = require('../bandit');
const generator = require('../generator');
const cache = require('../cache');

const router = express.Router();

// Get recommendations for user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { context = '{}' } = req.query;
    
    const cacheKey = cache.getRecommendationsKey(userId);
    const cachedRecs = await cache.get(cacheKey);
    
    if (cachedRecs) {
      return res.json(cachedRecs);
    }
    
    // Define different recommendation algorithms
    const algorithms = [
      {
        name: 'popularity_based',
        getRecommendations: async () => {
          const query = `
            SELECT p.*, COUNT(e.id) as interaction_count
            FROM products p
            LEFT JOIN events e ON p.id = e.product_id
            GROUP BY p.id
            ORDER BY interaction_count DESC
            LIMIT 20
          `;
          const result = await pgPool.query(query);
          return result.rows;
        }
      },
      {
        name: 'category_based',
        getRecommendations: async () => {
          // Get user's preferred categories
          const categoryQuery = `
            SELECT p.category, COUNT(e.id) as view_count
            FROM events e
            JOIN products p ON e.product_id = p.id
            WHERE e.user_id = $1 AND e.event_type = 'view'
            GROUP BY p.category
            ORDER BY view_count DESC
            LIMIT 3
          `;
          
          const categoryResult = await pgPool.query(categoryQuery, [userId]);
          const topCategories = categoryResult.rows.map(row => row.category);
          
          if (topCategories.length === 0) {
            // Fallback if no user history
            const fallbackQuery = 'SELECT * FROM products ORDER BY created_at DESC LIMIT 20';
            const fallbackResult = await pgPool.query(fallbackQuery);
            return fallbackResult.rows;
          }
          
          // Get products from preferred categories
          const productQuery = `
            SELECT * FROM products 
            WHERE category = ANY($1) 
            ORDER BY created_at DESC 
            LIMIT 20
          `;
          
          const productResult = await pgPool.query(productQuery, [topCategories]);
          return productResult.rows;
        }
      }
    ];
    
    // Use multi-armed bandit to select algorithm
    const parsedContext = JSON.parse(context);
    const selectedAlgorithm = await bandit.selectAlgorithm(userId, parsedContext, algorithms);
    
    // Get candidate products
    const candidateProducts = await selectedAlgorithm.getRecommendations();
    
    // Rank products
    const rankedProducts = await ranker.rankProducts(userId, candidateProducts, parsedContext);
    
    // Generate enhanced content
    const enhancedProducts = await Promise.all(
      rankedProducts.slice(0, 10).map(async (product) => {
        const description = await generator.generateProductDescription(product);
        const personalizedRec = await generator.generatePersonalizedRecommendation(userId, product);
        
        return {
          ...product,
          enhanced_description: description,
          personalized_recommendation: personalizedRec,
        };
      })
    );
    
    // Cache recommendations
    await cache.set(cacheKey, enhancedProducts, 1800); // 30 minutes
    
    res.json(enhancedProducts);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provide feedback on recommendations (for bandit learning)
router.post('/feedback', async (req, res) => {
  try {
    const { userId, algorithm, wasSuccessful, interactionType } = req.body;
    
    await bandit.updateAlgorithmPerformance(algorithm, wasSuccessful);
    
    res.json({ message: 'Feedback recorded' });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;