import express from 'express';
import {
  create,
  getAll,
  getById,
  updateById,
  deleteById
} from '../controllers/book.controller.js';
import { asyncHandler } from '../middlewares/ErrorHandling.js';
import { auth,roles} from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import {upload} from '../middlewares/multer.middleware.js';

const bookRouter = express.Router();

bookRouter.post('/addbook',auth(),authorize(roles.admin),upload.single("image"),asyncHandler(create));
bookRouter.get('/allbooks',auth(),authorize(roles.admin), asyncHandler(getAll));
bookRouter.get('/:id',auth(),authorize(roles.admin), asyncHandler(getById));
bookRouter.patch('/:id',auth(),authorize(roles.admin), asyncHandler(updateById));
bookRouter.delete('/:id',auth(),authorize(roles.admin), asyncHandler(deleteById));

export default bookRouter;