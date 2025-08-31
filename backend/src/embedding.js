const axios = require('axios');

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async getEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: 'text-embedding-ada-002',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  async getProductEmbeddings(products) {
    const embeddings = [];
    
    for (const product of products) {
      const text = `${product.name} ${product.description} ${product.category}`;
      const embedding = await this.getEmbedding(text);
      embeddings.push({
        productId: product.id,
        embedding,
      });
    }
    
    return embeddings;
  }
}

module.exports = new EmbeddingService();