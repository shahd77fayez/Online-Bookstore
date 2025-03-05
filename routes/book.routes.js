import express from 'express';
import booksController from '../controllers/book.controller.js';
import asyncHandler from '../middlewares/ErrorHandling.js';
const router = express.Router();

router.post('/addbook', async (req, res, next) => {
  console.log(req.body);
  const [err, data] = await asyncHandler(booksController.create(req.body));

  if (!err) return res.send({data});
  new ErrorClass(err,StatusCodes.CONFLICT);
});
router.get('/allbooks', async (req, res, next) => {
  const [err, data] = await asyncHandler(booksController.getAll());

  if (!err) return res.send({data});

  next(new CustomError(err.message, 422));
});
router.get('/:id', async (req, res, next) => {
  const [err, data] = await asyncHandler(booksController.getById(req.params.id));

  if (!err) return res.send({data});
  

  new ErrorClass(err,StatusCodes.CONFLICT);
});
router.patch('/:id', async (req, res, next) => {
  const [err, data] = await asyncHandler(booksController.updateById(req.params.id, req.body));

  if (!err) return res.send({data});
  new ErrorClass(err,StatusCodes.CONFLICT);
});
router.delete('/:id', async (req, res, next) => {
  const [err, data] = await asyncHandler(booksController.deleteById(req.params.id));

  if (!err) return res.send({data});
  new ErrorClass(err,StatusCodes.CONFLICT);
});

export default router;