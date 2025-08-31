// components/Recommendations.js
import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../lib/api';

const Recommendations = ({ userId, currentProductId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const context = currentProductId 
          ? JSON.stringify({ viewedProduct: currentProductId }) 
          : '{}';
        
        const response = await api.get(`/recommendations/user/${userId}?context=${context}`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Don't show error, just don't display recommendations
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId, currentProductId]);

  const handleProductClick = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  if (loading) {
    return (
      <div className="recommendations">
        <h2>Recommended for You</h2>
        <div>Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <div className="recommendations">
      <h2>Recommended for You</h2>
      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div 
            key={product.id} 
            className="recommendation-item"
            onClick={() => handleProductClick(product.id)}
          >
            <Image 
              src={product.image_url} 
              alt={product.name}
              width={200}
              height={150}
              style={{ objectFit: 'cover' }}
            />
            <h3>{product.name}</h3>
            <p className="price">${product.price}</p>
            {product.personalized_recommendation && (
              <p className="personalized">{product.personalized_recommendation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;