import Book from '../DB/models/book.model.js';
import logger from '../middlewares/logger.js';
import { ErrorClass } from '../middlewares/ErrorClass.js';

export const create = async (req, res, next) => {
  try {
    const newBook = await Book.create(req.body);
    logger.info('Book created successfully');
    res.status(201).json({ message: 'Book created successfully', data: newBook });
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    next(new ErrorClass(error.message, 400));
  }
};

export const getAll = async (req, res, next) => {
  try {
    const books = await Book.find();
    if (!books.length) return next(new ErrorClass('No books found', 404));
    
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
    
    res.json({ message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const deletedBook = await Book.findOneAndDelete({ bookId: req.params.id });
    if (!deletedBook) return next(new ErrorClass('Book not found', 404));
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(new ErrorClass(error.message, 500));
  }
};
