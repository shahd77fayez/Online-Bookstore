import express from 'express';
import {
  create,
  getAll,
  getById,
  updateById,
  deleteById
} from '../controllers/book.controller.js';
import {asyncHandler} from '../middlewares/ErrorHandling.js';
const router = express.Router();

router.post('/addbook', asyncHandler(async (req, res, next) => {
  try {
    const data = await create(req.body);
    res.status(StatusCodes.CREATED).send({ data });
  } catch (error) {
    next(new ErrorClass(error.message, StatusCodes.BAD_REQUEST));
  }
}));

router.get('/allbooks', asyncHandler(async (req, res, next) => {
  try {
    const data = await getAll();
    if (!data.length) return next(new ErrorClass('No books found', StatusCodes.NOT_FOUND));
    res.send({ data });
  } catch (error) {
    next(new ErrorClass(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const data = await getById(req.params.id);
  if (!data) return next(new ErrorClass('Book not found', StatusCodes.NOT_FOUND));
  res.send({ data });
}));

router.patch('/:id', asyncHandler(async (req, res, next) => {
  const data = await updateById(req.params.id, req.body);
  if (!data) return next(new ErrorClass('Book not found', StatusCodes.NOT_FOUND));
  res.send({ data });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  const data = await deleteById(req.params.id);
  if (!data) return next(new ErrorClass('Book not found', StatusCodes.NOT_FOUND));
  res.send({ message: 'Book deleted successfully' });
}));

export default router;