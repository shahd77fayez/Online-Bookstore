import stripe from '../config/stripeConfig.js'; // Ensure the path matches where the file is located

// Create a Payment Intent
export const createPaymentIntent = async (req, res) => {
  const {amount} = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {integration_check: 'accept_a_payment'} // Optional metadata for the payment
    });
    res.json({
      client_secret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({error: error.message});
  }
};
