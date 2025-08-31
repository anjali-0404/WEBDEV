import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import api from '../lib/api';
import useTrack from '../lib/useTrack';
import Recommendations from '../components/Recommendations';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const { trackEvent } = useTrack();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if backend is available first
        try {
          await api.get('/health');
          setBackendAvailable(true);
        } catch (err) {
          console.warn('Backend not available, using mock data');
          setBackendAvailable(false);
        }

        // Check if user is logged in
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else if (backendAvailable) {
          // Only try to create user if backend is available
          await createTemporaryUser();
        } else {
          // Use mock user ID if backend is down
          const mockUserId = `mock_user_${Date.now()}`;
          localStorage.setItem('userId', mockUserId);
          setUserId(mockUserId);
        }

        await fetchProducts();
      } catch (err) {
        setError('Failed to initialize application');
        console.error('Initialization error:', err);
      }
    };

    initializeApp();
  }, [backendAvailable]);

  const createTemporaryUser = async () => {
    try {
      const response = await api.post('/auth/register', {
        email: `temp_${Date.now()}@example.com`,
        password: 'temp_password',
      });
      
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('authToken', response.data.token);
      setUserId(response.data.user.id);
    } catch (error) {
      console.error('Error creating temporary user:', error);
      // Create a mock user ID if backend is not available
      const mockUserId = `mock_user_${Date.now()}`;
      localStorage.setItem('userId', mockUserId);
      setUserId(mockUserId);
      setBackendAvailable(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let productsData = [];
      
      if (backendAvailable) {
        const response = await api.get('/products?limit=10');
        productsData = response.data;
      } else {
        // Mock products data for demo when backend is down
        productsData = [
          {
            id: 1,
            name: "Wireless Headphones",
            price: 199.99,
            category: "Electronics",
            image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop",
            description: "High-quality wireless headphones with noise cancellation"
          },
          {
            id: 2,
            name: "Smart Watch",
            price: 299.99,
            category: "Electronics",
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop",
            description: "Feature-rich smartwatch with health monitoring"
          },
          {
            id: 3,
            name: "Running Shoes",
            price: 89.99,
            category: "Clothing",
            image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop",
            description: "Comfortable running shoes with extra cushioning"
          }
        ];
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    if (backendAvailable) {
      trackEvent('view', productId);
    }
    window.location.href = `/product/${productId}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div>Loading products...</div>
        {!backendAvailable && <div style={{color: 'orange'}}>Using offline mode</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>AI E-Commerce Store</title>
        <meta name="description" content="AI-powered e-commerce experience" />
      </Head>

      <main>
        <h1>Welcome to Our Store</h1>
        {!backendAvailable && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            Running in offline mode - some features may be limited
          </div>
        )}
        
        <section className="featured-products">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <Image 
                  src={product.image_url} 
                  alt={product.name}
                  width={250}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                <p className="category">{product.category}</p>
              </div>
            ))}
          </div>
        </section>

        {userId && backendAvailable && <Recommendations userId={userId} />}
      </main>
    </div>
  );
}