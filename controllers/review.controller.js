import process from 'node:process';
import dotenv from 'dotenv';
import redisClient from '../config/config-redis.js';
import Book from '../DB/models/book.model.js';
import {Review} from '../DB/models/review.model.js';
import userModel from '../DB/models/user.model.js';
import logger from '../middlewares/logger.js';
import {reviewValidation} from '../validation/review.validation.js';
import {notificationController} from './notification.controller.js';

dotenv.config({path: './config/.env'});

// Create a new review
export const createReview = async (req, res) => {
  logger.info(`User ${req.user._id} is creating a review for book ${req.body.book}`);
  // Validate request body
  const {error} = reviewValidation.createReview.validate(req.body);
  if (error) {
    logger.warn(`Validation error: ${error.details[0].message}`);
    return res.status(400).json({message: error.details[0].message});
  }

  // Check if book exists
  const book = await Book.findById(req.body.book);
  if (!book) {
    logger.warn(`Book ${req.body.book} not found`);
    return res.status(404).json({message: 'Book not found'});
  }

  // Check if user has already reviewed this book
  const existingReview = await Review.findOne({
    user: req.user._id,
    book: req.body.book
  });
  if (existingReview) {
    logger.warn(`User ${req.user._id} already reviewed book ${req.body.book}`);
    return res.status(400).json({message: 'You have already reviewed this book'});
  }

  // Create review
  const review = new Review({
    user: req.user._id,
    book: req.body.book,
    rating: req.body.rating,
    review: req.body.review
  });

  // Save the review first
  await review.save();

  // Update book's reviews array
  await Book.findByIdAndUpdate(
    req.body.book,
    {$push: {reviews: review._id}},
    {new: true}
  );

  // Update cache if exists
  const cachedReviews = await redisClient.get(process.env.CACHE_KEY);
  if (cachedReviews) {
    const reviews = JSON.parse(cachedReviews);
    reviews.push(review._id);
    await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(reviews));
  } else {
    await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify([review._id]));
  }

  // Query for the populated review using the correct pattern
  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name email')
    .populate('book', 'title author');

  logger.info(`Review created successfully by user ${req.user._id} for book ${req.body.book}`);

  // Create a single notification for all admin users
  // Find all admin users
  const adminUsers = await userModel.find({role: 'Admin'});

  if (adminUsers && adminUsers.length > 0) {
    // Get book details for the notification message
    const bookTitle = book.title || 'a book';

    // Extract admin IDs
    const adminIds = adminUsers.map((admin) => admin._id);

    // Create a single notification for all admins
    await notificationController.createMultiRecipientNotification(
      adminIds,
      'review',
      'New Book Review Posted',
      `User ${req.user.username || 'A user'} left a ${req.body.rating}-star review on "${bookTitle}"`,
      review._id,
      'Review'
    );

    logger.info(`Notification sent to ${adminUsers.length} admin users about new review`);
  } else {
    logger.info(`No admin users found`);
  }

  res.status(201).json(populatedReview);
};

// Get all reviews for a book
export const getBookReviews = async (req, res) => {
  logger.info(`Fetching reviews for book ${req.params.bookId}`);
  const {bookId} = req.params;
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({book: bookId})
    .populate('user', 'name email')
    .populate('book', 'title author')
    .skip(skip)
    .limit(limit)
    .sort({createdAt: -1});

  const total = await Review.countDocuments({book: bookId});

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReviews: total
  });
};

// Update a review
export const updateReview = async (req, res) => {
  logger.info(`User ${req.user._id} is updating review ${req.params.reviewId}`);
  const {reviewId} = req.params;

  // Validate request body
  const {error} = reviewValidation.updateReview.validate(req.body);
  if (error) {
    logger.warn(`Validation error: ${error.details[0].message}`);
    return res.status(400).json({message: error.details[0].message});
  }

  // Find review and check ownership
  const review = await Review.findById(reviewId);
  if (!review) {
    logger.warn(`Review ${reviewId} not found`);
    return res.status(404).json({message: 'Review not found'});
  }

  if (review.user.toString() !== req.user._id.toString()) {
    logger.warn(`Unauthorized update attempt by user ${req.user._id} on review ${reviewId}`);
    return res.status(403).json({message: 'You can only update your own reviews'});
  }

  // Update review
  review.set(req.body);
  await review.save();

  // Populate user and book details using the correct pattern
  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name email')
    .populate('book', 'title author');

  logger.info(`Review ${reviewId} updated successfully by user ${req.user._id}`);
  res.json(populatedReview);
};

// Delete a review
export const deleteReview = async (req, res) => {
  logger.info(`User ${req.user._id} is deleting review ${req.params.reviewId}`);
  const {reviewId} = req.params;

  // Find review and check ownership
  const review = await Review.findById(reviewId);
  if (!review) {
    logger.warn(`Review ${reviewId} not found`);
    return res.status(404).json({message: 'Review not found'});
  }

  if (review.user.toString() !== req.user._id.toString()) {
    logger.warn(`Unauthorized delete attempt by user ${req.user._id} on review ${reviewId}`);
    return res.status(403).json({message: 'You can only delete your own reviews'});
  }

  // Remove review from book's reviews array
  await Book.findByIdAndUpdate(
    review.book,
    {$pull: {reviews: reviewId}}
  );

  // Delete the review
  await review.deleteOne();

  // Update cache if exists
  const cachedReviews = await redisClient.get(process.env.CACHE_KEY);
  if (cachedReviews) {
    const reviews = JSON.parse(cachedReviews);
    const updatedReviews = reviews.filter((review) => review._id !== reviewId);
    await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(updatedReviews));
  } else {
    // repopulation on next GET request to be consistent with the new data
    await redisClient.del(process.env.CACHE_KEY);
  }

  logger.info(`Review ${reviewId} deleted successfully by user ${req.user._id}`);
  res.json({message: 'Review deleted successfully'});
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  logger.info(`Fetching reviews for user ${req.user._id}`);
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({user: req.user._id})
    .populate('book', 'title author')
    .skip(skip)
    .limit(limit)
    .sort({createdAt: -1});

  const total = await Review.countDocuments({user: req.user._id});

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReviews: total
  });
};
