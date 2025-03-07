import process from 'node:process';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({path: './config/.env'}); // Use the correct import for ES modules
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize with your Stripe secret key
export default stripe;
