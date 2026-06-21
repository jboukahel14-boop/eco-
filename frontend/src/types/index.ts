export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[] | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  attributes: Record<string, string[]> | null;
  weight: number | null;
  rating: number;
  review_count: number;
  sold_count: number;
  discount_percent: number | null;
  margin: number | null;
  margin_percent: number | null;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  categories: Category[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  is_active: boolean;
  products_count?: number;
  children?: Category[];
}

export interface CartItem {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  subtotal: number;
  stock_quantity: number;
  selected_attributes: Record<string, string> | null;
  max_purchasable: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
  item_count: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  status: OrderStatus;
  session_id: string | null;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string | null;
  payment_status: PaymentStatus;
  transaction_id: string | null;
  notes: string | null;
  confirmed_at: string | null;
  items: OrderItem[];
  margin: number | null;
  margin_percent: number | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string;
  unit_price: number;
  cost_price: number | null;
  quantity: number;
  subtotal: number;
  selected_attributes: Record<string, string> | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface CheckoutForm {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: 'stripe' | 'mock';
}

export interface ProductFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  sort?: 'price' | 'name' | 'created_at' | 'rating' | 'sold_count';
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters?: {
    categories: Category[];
  };
}

export interface AdminMetrics {
  revenue: {
    monthly: number;
    all_time: number;
    margin: number;
    margin_percent: number;
  };
  orders: {
    total: number;
    active: number;
    pending: number;
  };
  inventory: {
    low_stock_count: number;
    out_of_stock_count: number;
    low_stock: Product[];
    out_of_stock: Product[];
  };
}

export interface WebSocketMessage {
  type: 'inventory.updated' | 'order.confirmed' | 'low.stock.alert';
  data: Record<string, unknown>;
}
