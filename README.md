# Online Bookstore API

A feature-rich Node.js REST API for an online bookstore platform with user authentication, book management, reviews, shopping cart, and order processing capabilities.

## Features

- **User Management**
  - JWT-based authentication
  - Role-based authorization (Admin/User)
  - User profile management
  - Token blacklisting for secure logout
  - Password reset functionality
  - Email verification

- **Book Management**
  - Browse and search books
  - Book details with cover images (using Cloudinary)
  - Category-based organization

- **Review System**
  - Users can review books
  - Rating system
  - Admin notification for new reviews
  - Review moderation

- **Shopping Features**
  - Shopping cart management
  - Secure payment processing (Stripe integration)
  - Order tracking
  - Email notifications

- **Additional Features**
  - Real-time notifications (Socket.io)
  - Redis caching
  - File upload support
  - Comprehensive error handling
  - Request validation
  - Logging system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **Payment Processing**: Stripe
- **Real-time Communication**: Socket.io
- **Email Service**: Nodemailer
- **Logging**: Winston & Morgan
- **Development**: Nodemon
- **Code Quality**: ESLint

## Project Structure

```
├── DB/
│   ├── connection.js
│   └── models/
│       ├── book.model.js
│       ├── notification.model.js
│       ├── order.model.js
│       ├── review.model.js
│       └── user.model.js
├── config/
│   ├── config-redis.js
│   └── stripeConfig.js
├── controllers/
│   ├── book.controller.js
│   ├── cart.controller.js
│   ├── notification.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── review.controller.js
│   └── user.controller.js
├── middlewares/
│   ├── auth.js
│   ├── authorize.js
│   ├── email.js
│   ├── ErrorHandling.js
│   ├── validation.js
│   └── ...
├── routes/
│   ├── book.routes.js
│   ├── cart.routes.js
│   ├── notification.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   ├── review.routes.js
│   └── user.routes.js
├── index.js
└── index.router.js
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_key
   CLOUDINARY_URL=your_cloudinary_url
   REDIS_URL=your_redis_url
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Documentation

Complete API documentation is available on Postman:
[Online Bookstore API Documentation](https://www.postman.com/interstellar-firefly-758691/nodejs-project/overview)

### Authentication

- POST `/api/users/signup` - Register a new user
- POST `/api/users/login` - User login
- POST `/api/users/logout` - User logout

### Books

- GET `/api/books` - List all books
- GET `/api/books/:id` - Get book details
- POST `/api/books` - Add new book (Admin only)
- PUT `/api/books/:id` - Update book (Admin only)
- DELETE `/api/books/:id` - Delete book (Admin only)

### Reviews

- POST `/api/reviews` - Create a review (Authentication required)
- GET `/api/reviews/book/:bookId` - Get book reviews
- PUT `/api/reviews/:id` - Update review
- DELETE `/api/reviews/:id` - Delete review

### Shopping Cart

- GET `/api/cart` - View cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update` - Update cart item
- DELETE `/api/cart/remove` - Remove item from cart

### Orders

- POST `/api/orders` - Create order
- GET `/api/orders` - List user orders
- GET `/api/orders/:id` - Get order details

## Error Handling

The API uses a centralized error handling mechanism with custom error classes and middleware for consistent error responses.

## Security Features

- JWT-based authentication
- Password hashing (bcryptjs)
- Token blacklisting
- Request validation
- Role-based access control
- Secure headers

## Logging

The application uses Winston for logging with different log levels:
- Error logs: `logs/error.log`
- Warning logs: `logs/warn.log`
- Combined logs: `logs/combined.log`

## Base URL
All API endpoints are accessible under: `http://3.87.183.111/api`
