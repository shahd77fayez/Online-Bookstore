import Book from '../DB/models/book.model.js';
import logger from '../middlewares/logger.js';
import { ErrorClass } from '../middlewares/ErrorClass.js';
import redisClient from '../config/config-redis.js';
import { bookSchemaValidation } from "../validation/bookValidation.js";

export const create = async (req, res, next) => {
  try {
    const { image } = req.body;
    const { err } = bookSchemaValidation.validate(req.body);
    if (err) return next(new ErrorClass(err.message, 500));

    let imagePath;
    if (image) {
      imagePath = image;
    } else if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ error: "Image is required (file or URL)" });
    }

    const newBook = await Book.create(req.body);
    logger.info('Book created successfully');

    // repopulation on next GET request to be consistent with the new data
    await redisClient.del(process.env.CACHE_KEY);

    res.status(201).json({ message: 'Book created successfully', data: newBook });
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    next(new ErrorClass(error.message, 400));
  }
};

export const getAll = async (req, res, next) => {
  try {
    let { skip, limit,filter } = req.query;
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


    const books = await Book.find(filter).skip(skip).limit(limit);
    if (!books.length) return next(new ErrorClass('No books found', 404));

    // Store result in cache
    await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(books));


    logger.info('Fetching all books');
    res.json({ message: 'Books fetched successfully', data: books });
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    next(new ErrorClass(error.message, 500));
  }
};

export const getById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ bookId: req.params.id });
    if (!book) return next(new ErrorClass('Book not found', 404));

    res.json({ data: book });
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};

export const updateById = async (req, res, next) => {
  try {
    const updatedBook = await Book.findOneAndUpdate({ bookId: req.params.id }, req.body, { new: true });
    if (!updatedBook) return next(new ErrorClass('Book not found', 404));


    // Update cache if exists
    const cachedBooks = await redisClient.get(process.env.CACHE_KEY);
    if (cachedBooks) {
      let bookList = JSON.parse(cachedBooks);
      bookList = bookList.map(book => (book.bookId == req.params.id ? updatedBook : book));

      // Store updated list in cache
      await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(bookList));
    } else {
      // repopulation on next GET request to be consistent with the new data
      await redisClient.del(process.env.CACHE_KEY);
    }



    res.json({ message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const deletedBook = await Book.findOneAndDelete({ bookId: req.params.id });
    if (!deletedBook) return next(new ErrorClass('Book not found', 404));

    // Update cache if exists
    const cachedBooks = await redisClient.get(process.env.CACHE_KEY);
    if (cachedBooks) {
      let bookList = JSON.parse(cachedBooks);
      bookList = bookList.filter(book => book.bookId != req.params.id);

      // Store updated list in cache
      await redisClient.setEx(process.env.CACHE_KEY, 3600, JSON.stringify(bookList));
    } else {
      // repopulation on next GET request to be consistent with the new data
      await redisClient.del(process.env.CACHE_KEY);
    }


    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};
