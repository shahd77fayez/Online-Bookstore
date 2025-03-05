import Router from "express"
import * as userController from "../controllers/user.controller.js"
import {auth} from "../middlewares/auth.js"
import { asyncHandler } from "../middlewares/ErrorHandling.js"
const userRouter = Router()

userRouter.post('/signup',asyncHandler(userController.signup))

userRouter.patch('/confirm-email',asyncHandler(userController.confirmEmail))

userRouter.post('/signin',asyncHandler(userController.signin))

userRouter.patch('/send-code',asyncHandler(userController.sendCode))

userRouter.patch('/update',auth(),asyncHandler(userController.UpdateUser))

userRouter.patch('/change-pass',auth(),asyncHandler(userController.changePass))

userRouter.patch('/soft-del',auth(),asyncHandler(userController.softDelete))

userRouter.post('/logout',auth(),asyncHandler(userController.logout))

export default userRouter