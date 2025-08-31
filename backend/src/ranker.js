const { pgPool } = require('./db');

class Ranker {
  constructor() {
    // Weights for different ranking factors
    this.weights = {
      popularity: 0.3,
      relevance: 0.4,
      recency: 0.2,
      diversity: 0.1,
    };
  }

  async rankProducts(userId, candidateProducts, context = {}) {
    // Get user's recent interactions
    const userInteractions = await this.getUserInteractions(userId);
    
    // Calculate scores for each product
    const scoredProducts = await Promise.all(
      candidateProducts.map(async (product) => {
        const popularityScore = await this.calculatePopularityScore(product.id);
        const relevanceScore = this.calculateRelevanceScore(product, userInteractions);
        const recencyScore = this.calculateRecencyScore(product);
        const diversityScore = this.calculateDiversityScore(product, context.viewedProducts || []);
        
        const totalScore = 
          popularityScore * this.weights.popularity +
          relevanceScore * this.weights.relevance +
          recencyScore * this.weights.recency +
          diversityScore * this.weights.diversity;
        
        return {
          ...product,
          score: totalScore,
        };
      })
    );
    
    // Sort by score descending
    return scoredProducts.sort((a, b) => b.score - a.score);
  }

  async getUserInteractions(userId) {
    const query = `
      SELECT product_id, event_type, timestamp 
      FROM events 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    
    const result = await pgPool.query(query, [userId]);
    return result.rows;
  }

  async calculatePopularityScore(productId) {
    const query = `
      SELECT COUNT(*) as interaction_count 
      FROM events 
      WHERE product_id = $1 AND event_type IN ('purchase', 'view')
    `;
    
    const result = await pgPool.query(query, [productId]);
    return Math.min(1, result.rows[0].interaction_count / 100);
  }

  calculateRelevanceScore(product, userInteractions) {
    // Simple implementation - could be enhanced with collaborative filtering
    const viewedCategories = new Set(
      userInteractions
        .filter(i => i.event_type === 'view')
        .map(i => i.category)
    );
    
    return viewedCategories.has(product.category) ? 1 : 0.2;
  }

  calculateRecencyScore(product) {
    // Newer products get higher scores
    const daysSinceCreation = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceCreation / 30));
  }

  calculateDiversityScore(product, viewedProducts) {
    // Avoid recommending products the user has recently viewed
    return viewedProducts.includes(product.id) ? 0.1 : 1;
  }
}

module.exports = new Ranker();