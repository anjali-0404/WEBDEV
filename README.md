# AI-Driven E-Commerce Starter Monorepo

A full-stack e-commerce application with AI-powered recommendations and content generation.

## Features

- Product catalog with PostgreSQL
- User event tracking
- AI-powered product recommendations using multi-armed bandit algorithm
- AI-generated product descriptions using OpenAI
- Redis caching for improved performance
- MongoDB for storing generated content and algorithm performance
- Next.js frontend with tracking hooks

## Prerequisites

- Docker and Docker Compose
- OpenAI API key

## Setup

1. Clone the repository
2. Add your OpenAI API key to the `.env` file
3. Run `docker-compose up --build`
4. Access the application at http://localhost:3000

## API Endpoints

- `GET /api/products` - Get products
- `GET /api/products/:id` - Get single product
- `POST /api/events` - Track user event
- `GET /api/recommendations/user/:userId` - Get personalized recommendations
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## Architecture

- **Backend**: Node.js + Express with REST APIs
- **Database**: PostgreSQL for transactional data
- **NoSQL**: MongoDB for generated content and experiments
- **Cache**: Redis for caching and session storage
- **Frontend**: Next.js with client-side tracking hooks