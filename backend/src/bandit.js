const { getMongoDb } = require('./db');

class MultiArmedBandit {
  constructor() {
    this.epsilon = 0.1; // Exploration rate
  }

  async selectAlgorithm(userId, context, algorithms) {
    // Get algorithm performance from MongoDB
    const mongoDb = getMongoDb();
    const collection = mongoDb.collection('algorithm_performance');
    
    // Get performance data for each algorithm
    const algorithmData = await Promise.all(
      algorithms.map(async (algo) => {
        const data = await collection.findOne({ algorithm: algo.name });
        return {
          name: algo.name,
          successes: data?.successes || 0,
          trials: data?.trials || 0,
        };
      })
    );
    
    // Epsilon-greedy strategy
    if (Math.random() < this.epsilon) {
      // Exploration: choose random algorithm
      return algorithms[Math.floor(Math.random() * algorithms.length)];
    } else {
      // Exploitation: choose algorithm with best success rate
      let bestAlgorithm = algorithms[0];
      let bestScore = 0;
      
      for (const algo of algorithmData) {
        const score = algo.trials > 0 ? algo.successes / algo.trials : 0;
        if (score > bestScore) {
          bestScore = score;
          bestAlgorithm = algorithms.find(a => a.name === algo.name);
        }
      }
      
      return bestAlgorithm;
    }
  }

  async updateAlgorithmPerformance(algorithmName, wasSuccessful) {
    const mongoDb = getMongoDb();
    const collection = mongoDb.collection('algorithm_performance');
    
    await collection.updateOne(
      { algorithm: algorithmName },
      { 
        $inc: { 
          trials: 1,
          successes: wasSuccessful ? 1 : 0
        }
      },
      { upsert: true }
    );
  }
}

module.exports = new MultiArmedBandit();