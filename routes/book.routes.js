import express from 'express';
import {
  create,
  getAll,
  getById,
  updateById,
  deleteById
} from '../controllers/book.controller.js';
import { asyncHandler } from '../middlewares/ErrorHandling.js';

const bookRouter = express.Router();

bookRouter.post('/addbook', asyncHandler(create));
bookRouter.get('/allbooks', asyncHandler(getAll));
bookRouter.get('/:id', asyncHandler(getById));
bookRouter.patch('/:id', asyncHandler(updateById));
bookRouter.delete('/:id', asyncHandler(deleteById));

export default bookRouter;