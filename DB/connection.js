import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();
console.log("DB_URL:", process.env.DB_URL);

const connectDB = async()=>{
    return await mongoose
    .connect(process.env.DB_URL)
    .then(res=>{
        console.log(`DB Connected Successfully........`);
    })
    .catch(
        err=>{
            console.log(`Failed Connection: ${err}`);
        }
    );
}

export default connectDB