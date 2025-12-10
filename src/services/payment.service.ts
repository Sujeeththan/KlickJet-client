import apiClient from '@/lib/apiClient';

export interface CreatePaymentIntentRequest {
  order_id: string;
  payment_method: 'online' | 'card';
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  message: string;
  payment: {
    _id: string;
    customer_id: string;
    order_id: string;
    payment_method: string;
    status: string;
    stripe_payment_intent?: string;
  };
  stripeClientSecret?: string;
}

export const paymentService = {
  /**
   * Create a payment intent for online/card payments
   * @param data Payment intent creation data
   * @returns Payment response with client secret
   */
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const response = await apiClient.post<CreatePaymentIntentResponse>('/payments', data);
    return response.data;
  },
};
