import mongoose from "mongoose";

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