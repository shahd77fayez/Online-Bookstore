import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./middlewares/ErrorHandling.js";
import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";
import orderRouter from "./routes/order.routes.js";


const intiApp = (app, express) => {
    //Convert Buffer Data
    app.use(express.json({}))
    //Setup API Routing
    app.use(`/user`, userRouter)
    //app.use(`/cart`,)
    app.use(`/order`, orderRouter)
    app.use(`/book`, bookRouter)
    //app.use(`/review`,)
    app.use('*', (req, res, next) => {
        res.send("In-valid Routing please check URL or Method")
    })
    app.use(globalErrorHandling)

    connectDB()
}

export default intiApp