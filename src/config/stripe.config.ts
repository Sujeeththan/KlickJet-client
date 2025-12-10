// Stripe configuration for frontend
import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export { stripePublishableKey };
