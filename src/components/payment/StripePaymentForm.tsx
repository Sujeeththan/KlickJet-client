"use client";

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  totalAmount: number;
}

export function StripePaymentForm({ onSuccess, onError, totalAmount }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmed`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      } else {
        onError('Payment was not completed');
        toast.error('Payment was not completed');
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      onError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Amount to pay: <span className="font-semibold text-foreground">LKR {totalAmount.toFixed(2)}</span>
        </p>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs',
        }}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay LKR ${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Your payment is secured by Stripe. Card details are never stored on our servers.
      </p>
    </form>
  );
}
