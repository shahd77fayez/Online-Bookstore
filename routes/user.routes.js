import Router from 'express';
import * as userController from '../controllers/user.controller.js';
import {auth} from '../middlewares/auth.js';
import {asyncHandler} from '../middlewares/ErrorHandling.js';
import {validation} from '../middlewares/validation.js';
import * as validators from '../validation/user.validation.js';

const userRouter = Router();

userRouter.post('/signup', validation(validators.signUpVal), asyncHandler(userController.signup));

userRouter.patch('/confirm-email', validation(validators.confirmEmailVal), asyncHandler(userController.confirmEmail));

userRouter.post('/signin', validation(validators.signInVal), asyncHandler(userController.signin));

userRouter.patch('/send-code', validation(validators.sendCodeVal), asyncHandler(userController.sendCode));

userRouter.patch('/reset-pass', validation(validators.resetPasswordVal), asyncHandler(userController.resetPassword));

userRouter.patch('/update', auth(), validation(validators.updateUserVal), asyncHandler(userController.UpdateUser));

userRouter.patch('/change-pass', auth(), validation(validators.changePasswordVal), asyncHandler(userController.changePass));

userRouter.patch('/soft-del', auth(), validation(validators.deleteUserVal), asyncHandler(userController.softDelete));

userRouter.post('/logout', auth(), validation(validators.logoutVal), asyncHandler(userController.logout));

export default userRouter;
