import Stripe from 'stripe';

// Initialize the Stripe client with the API key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use the latest stable API version
}); 