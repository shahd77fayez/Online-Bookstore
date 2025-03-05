import mongoose from "mongoose";

const connectDB = async()=>{
    return await mongoose
    .connect(`mongodb+srv://root:vobzdgAREZ3ob63Q@cluster0.xirld.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
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