import dotenv from 'dotenv';
dotenv.config({path:"./config/.env"});  
import Stripe from 'stripe'; // Use the correct import for ES modules
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize with your Stripe secret key
export default stripe;
