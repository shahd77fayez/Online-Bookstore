import Router from 'express';
import * as cartController from '../controllers/cart.controller.js';
import {auth} from '../middlewares/auth.js';
import {asyncHandler} from '../middlewares/ErrorHandling.js';

const cartRouter = Router();

cartRouter.get('/', auth(), asyncHandler(cartController.getAllItems));

cartRouter.patch('/add-to-cart', auth(), asyncHandler(cartController.addItemToCart));

cartRouter.delete('/remove/:bookId', auth(), asyncHandler(cartController.removeItem));

cartRouter.delete('/remove', auth(), asyncHandler(cartController.removeAllItems));

export default cartRouter;
