import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./middlewares/ErrorHandling.js";
import userRouter from "./routes/user.routes.js";


const intiApp = (app,express)=>{
    //Convert Buffer Data
    app.use(express.json({}))
    //Setup API Routing
    app.use(`/user`,userRouter)
    //app.use(`/cart`,)
    //app.use(`/order`,)
   //app.use(`/book`,)
   //app.use(`/review`,)
   app.use('*',(req,res,next)=>{
    res.send("In-valid Routing please check URL or Method")
   })
   app.use(globalErrorHandling)

   connectDB()
}

export default intiApp