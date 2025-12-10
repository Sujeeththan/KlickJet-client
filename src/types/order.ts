export interface Product {
    _id: string;
    name: string;
    price: number;
    seller_id?: string | Seller;
}

export interface Seller {
    _id: string;
    name: string;
    shopName: string;
}

export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone_no?: string;
    address?: string;
}

export interface OrderItem {
    product: string | Product; // Can be populated
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    customer_id: string | Customer; // Backend uses customer_id, can be populated
    items: OrderItem[];
    total_amount: number; // Backend uses total_amount (snake_case)
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: string;
    contactInfo?: {
        firstName: string;
        lastName: string;
        phone: string;
    };
    paymentMethod?: 'cod' | 'online';
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderData {
    items: { product: string; quantity: number }[];
    shippingAddress: string;
}
