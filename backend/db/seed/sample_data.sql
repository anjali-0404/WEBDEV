-- Sample products
INSERT INTO products (name, description, price, category, image_url) VALUES
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'Electronics', 'https://example.com/headphones.jpg'),
('Smart Watch', 'Feature-rich smartwatch with health monitoring', 299.99, 'Electronics', 'https://example.com/smartwatch.jpg'),
('Running Shoes', 'Comfortable running shoes with extra cushioning', 89.99, 'Clothing', 'https://example.com/shoes.jpg'),
('Coffee Maker', 'Automatic coffee maker with programmable settings', 79.99, 'Home', 'https://example.com/coffeemaker.jpg'),
('Yoga Mat', 'Eco-friendly yoga mat with non-slip surface', 39.99, 'Fitness', 'https://example.com/yogamat.jpg'),
('Bluetooth Speaker', 'Portable Bluetooth speaker with excellent sound quality', 129.99, 'Electronics', 'https://example.com/speaker.jpg'),
('Water Bottle', 'Insulated water bottle that keeps drinks cold for 24 hours', 34.99, 'Home', 'https://example.com/waterbottle.jpg'),
('Backpack', 'Durable backpack with laptop compartment', 59.99, 'Accessories', 'https://example.com/backpack.jpg'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 49.99, 'Home', 'https://example.com/lamps.jpg'),
('Fitness Tracker', 'Basic fitness tracker with step counting', 49.99, 'Fitness', 'https://example.com/tracker.jpg');

-- Sample user (password: password123)
INSERT INTO users (email, password_hash) VALUES
('test@example.com', '$2a$10$rOzZSWb2h5W.yLhL1pC.2uY8p7kQjJ9rXxW8nNqLmBvV1dS2rT3uC');