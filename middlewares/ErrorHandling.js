import { ErrorClass } from "./ErrorClass.js";

export const asyncHandler = (func) =>{
    return (req,res,next)=>{
        return func(req,res,next)
        .catch(error=>{
            return next (new ErrorClass(error.msg,error.status))
        }
        )
    }
}

export const globalErrorHandling = (error,req,res,next)=>{
    return res.status(error.status || 500).json({msgError:error.msg,status:error.status})
}