export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string | { _id: string; name: string }; // Can be string ID or populated object
    image?: string;
    images?: string[]; // Multiple images support
    mainImageIndex?: number;
    stock: number;
    instock: number; // Alias for stock, used by seller pages
    seller: string | { _id: string; name: string; shopName?: string }; // Can be string ID or populated object
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string; // Logic for upload might be separate
    stock: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}
