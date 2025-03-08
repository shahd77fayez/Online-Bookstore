import process from 'node:process';
import dotenv from 'dotenv';
import redisClient from '../config/config-redis.js';
import Book from '../DB/models/book.model.js';
import userModel from '../DB/models/user.model.js';
import {ErrorClass} from '../middlewares/ErrorClass.js';
import logger from '../middlewares/logger.js';
import {bookSchemaValidation} from '../validation/bookValidation.js';
import {notificationController} from './notification.controller.js';

dotenv.config({path: './config/.env'});

export const create = async (req, res, next) => {
  try {
    const {image} = req.body;
    const {err} = bookSchemaValidation.validate(req.body);
    if (err) return next(new ErrorClass(err.message, 500));

    let imagePath;
    if (image) {
      imagePath = image;
    } else if (req.file) {
      // eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
      imagePath = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({error: 'Image is required (file or URL)'});
    }

    const newBook = await Book.create(req.body);
    logger.info('Book created successfully');

    // repopulation on next GET request to be consistent with the new data
    await redisClient.del(process.env.CACHE_KEY);

    // Create a notification for all users about the new book
    const users = await userModel.find({isDeleted: false, isConfirmed: true});
    if (users && users.length > 0) {
      const userIds = users.map((user) => user._id);
      console.log('Book Model:', Book);
      await notificationController.createMultiRecipientNotification(
        userIds,
        'system',
        'New Book Added',
        `A new book "${newBook.title}" by ${newBook.author} has been added to our collection.`,
        newBook._id,
        'Books'
      );
      logger.info(`Notification sent to ${users.length} users about new book`);
    }

    res.status(201).json({message: 'Book created successfully', data: newBook});
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    next(new ErrorClass(error.message, 400));
  }
};

export const getAll = async (req, res, next) => {
  try {
    let {skip, limit, filter} = req.query;
    skip = Number.parseInt(skip);
    limit = Number.parseInt(limit);
    skip = !Number.isNaN(Number.parseInt(skip)) ? Number.parseInt(skip) : 0;
    limit = !Number.isNaN(Number.parseInt(limit)) ? Number.parseInt(limit) : 10;
    filter = filter ? JSON.parse(filter) : {};

    // Check cache first
    const cachedData = await redisClient.get(process.env.CACHE_KEY);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const books = await Book.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'reviews',
        select: 'rating review',
        populate: {
          path: 'user',
          select: 'firstName lastName username email'
        }
      });
    if (!books.length) return next(new ErrorClass('No books found', 404));

    // Store result in cache
    await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(books));

    logger.info('Fetching all books');
    res.json({message: 'Books fetched successfully', data: books});
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    next(new ErrorClass(error.message, 500));
  }
};

export const getById = async (req, res, next) => {
  try {
    const book = await Book.findOne({bookId: req.params.id})
      .populate({
        path: 'reviews',
        select: 'rating review',
        populate: {
          path: 'user',
          select: 'firstName lastName username email'
        }
      });
    if (!book) return next(new ErrorClass('Book not found', 404));

    res.json({data: book});
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};

export const updateById = async (req, res, next) => {
  try {
    // Store the old book data for comparison
    const oldBook = await Book.findOne({bookId: req.params.id});
    if (!oldBook) return next(new ErrorClass('Book not found', 404));

    const updatedBook = await Book.findOneAndUpdate({bookId: req.params.id}, req.body, {new: true});
    if (!updatedBook) return next(new ErrorClass('Book not found', 404));

    // Update cache if exists
    const cachedBooks = await redisClient.get(process.env.CACHE_KEY);
    if (cachedBooks) {
      let bookList = JSON.parse(cachedBooks);
      bookList = bookList.map((book) => (book.bookId === req.params.id ? updatedBook : book));

      // Store updated list in cache
      await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(bookList));
    } else {
      // repopulation on next GET request to be consistent with the new data
      await redisClient.del(process.env.CACHE_KEY);
    }

    // Check for significant changes that would warrant a notification
    const significantChanges = [];
    if (oldBook.title !== updatedBook.title) {
      significantChanges.push(`Title changed from "${oldBook.title}" to "${updatedBook.title}"`);
    }
    if (oldBook.price !== updatedBook.price) {
      significantChanges.push(`Price changed from $${oldBook.price} to $${updatedBook.price}`);
    }
    if (oldBook.stock !== updatedBook.stock && updatedBook.stock > 0 && oldBook.stock === 0) {
      significantChanges.push(`Book is now back in stock`);
    }

    // If there are significant changes, notify users who have this book in their wishlist or cart
    if (significantChanges.length > 0) {
      // Find admin users to notify about the update
      const adminUsers = await userModel.find({role: 'Admin'});
      if (adminUsers && adminUsers.length > 0) {
        const adminIds = adminUsers.map((admin) => admin._id);
        await notificationController.createMultiRecipientNotification(
          adminIds,
          'system',
          'Book Updated',
          `The book "${updatedBook.title}" has been updated: ${significantChanges.join(', ')}.`,
          updatedBook._id,
          'Books'
        );
        logger.info(`Notification sent to ${adminUsers.length} admin users about book update`);
      }
    }

    res.json({message: 'Book updated successfully', data: updatedBook});
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const deletedBook = await Book.findOneAndDelete({bookId: req.params.id});
    if (!deletedBook) return next(new ErrorClass('Book not found', 404));

    // Update cache if exists
    const cachedBooks = await redisClient.get(process.env.CACHE_KEY);
    if (cachedBooks) {
      let bookList = JSON.parse(cachedBooks);
      bookList = bookList.filter((book) => book.bookId !== req.params.id);

      // Store updated list in cache
      await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(bookList));
    } else {
      // repopulation on next GET request to be consistent with the new data
      await redisClient.del(process.env.CACHE_KEY);
    }

    res.json({message: 'Book deleted successfully'});
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};
