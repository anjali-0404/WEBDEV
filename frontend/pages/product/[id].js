import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import api from '../../lib/api';
import useTrack from '../../lib/useTrack';
import Recommendations from '../../components/Recommendations';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const { trackEvent } = useTrack();

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      
      // Track product view
      const userId = localStorage.getItem('userId');
      if (userId) {
        trackEvent('view', id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
      // Mock product data for demo
      setProduct({
        id: id,
        name: "Sample Product",
        price: 99.99,
        category: "Electronics",
        description: "This is a sample product description.",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop"
      });
    } finally {
      setLoading(false);
    }
  }, [id, trackEvent]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleAddToCart = () => {
    trackEvent('cart_add', id);
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="container">
        <div>Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div>Product not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-page">
        <div className="product-details">
          <Image 
            src={product.image_url} 
            alt={product.name}
            width={500}
            height={400}
            style={{ objectFit: 'cover' }}
          />
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="price">${product.price}</p>
            <p className="category">{product.category}</p>
            <p className="description">{product.enhanced_description || product.description}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>

        {userId && <Recommendations userId={userId} currentProductId={id} />}
      </div>
    </div>
  );
}