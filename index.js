import dotenv from "dotenv"
import path from "path"
//import { fileURLToPath } from "url";
//import { dirname, join } from "path";

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

//dotenv.config({ path: join(__dirname, "config", ".env") });

dotenv.config({path:"./config/.env"});

import express from "express"
import intiApp from "./index.router.js"
const app = express();

const port = process.env.PORT;

intiApp(app,express)
app.listen(port,()=>{
    console.log(`Server is Up & Running on http://localhost:${port}`);
})