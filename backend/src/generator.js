const axios = require('axios');
const { getMongoDb } = require('./db');

class ContentGenerator {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async generateProductDescription(product) {
    try {
      // Check if we already have a generated description
      const mongoDb = getMongoDb();
      const collection = mongoDb.collection('generated_content');
      
      const existing = await collection.findOne({
        productId: product.id,
        type: 'description'
      });
      
      if (existing) {
        return existing.content;
      }
      
      // Generate new description
      const prompt = `Write an engaging product description for ${product.name} 
      that is approximately 50-70 words. The product is in the ${product.category} 
      category and costs $${product.price}.`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const generatedText = response.data.choices[0].message.content.trim();
      
      // Store in MongoDB
      await collection.insertOne({
        productId: product.id,
        type: 'description',
        content: generatedText,
        createdAt: new Date(),
      });
      
      return generatedText;
    } catch (error) {
      console.error('Error generating product description:', error);
      return product.description; // Fallback to original description
    }
  }

  async generatePersonalizedRecommendation(userId, product) {
    // This could be enhanced with user-specific data
    try {
      const prompt = `Create a short, personalized recommendation for ${product.name} 
      that highlights its key features and benefits. Keep it under 30 words.`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.8,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating personalized recommendation:', error);
      return `Check out ${product.name} - a great product in our ${product.category} collection!`;
    }
  }
}

module.exports = new ContentGenerator();