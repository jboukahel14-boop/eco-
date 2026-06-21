import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  Product,
  ProductFilters,
  Cart,
  CartItem,
  Order,
  CheckoutForm,
  AdminMetrics,
  Category,
  PaginatedResponse,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();

    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api/v1',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Session-ID': this.sessionId,
      },
      timeout: 15000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'An unexpected error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('cart_session');
    if (!sessionId) {
      sessionId = 'sess_' + crypto.randomUUID();
      localStorage.setItem('cart_session', sessionId);
    }
    return sessionId;
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Products
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params: Record<string, string | number | boolean> = {};
    if (filters.category) params.category = filters.category;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.in_stock) params.in_stock = true;
    if (filters.on_sale) params.on_sale = true;
    if (filters.sort) params.sort = filters.sort;
    if (filters.direction) params.direction = filters.direction;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    const { data } = await this.client.get('/products', { params });
    return data;
  }

  async getProduct(slug: string): Promise<{ data: Product }> {
    const { data } = await this.client.get(`/products/${slug}`);
    return data;
  }

  async searchProducts(query: string): Promise<PaginatedResponse<Product>> {
    const { data } = await this.client.get('/products/search', {
      params: { query },
    });
    return data;
  }

  // Cart
  async getCart(): Promise<{ data: Cart }> {
    const { data } = await this.client.get('/cart');
    return data;
  }

  async addToCart(
    productId: number,
    quantity: number = 1,
    attributes?: Record<string, string>
  ): Promise<{ data: CartItem }> {
    const { data } = await this.client.post('/cart', {
      product_id: productId,
      quantity,
      attributes,
    });
    return data;
  }

  async updateCartItem(
    itemId: number,
    quantity: number
  ): Promise<{ data: Cart }> {
    const { data } = await this.client.put(`/cart/${itemId}`, { quantity });
    return data;
  }

  async removeCartItem(itemId: number): Promise<{ data: Cart }> {
    const { data } = await this.client.delete(`/cart/${itemId}`);
    return data;
  }

  async clearCart(): Promise<{ data: Cart }> {
    const { data } = await this.client.delete('/cart');
    return data;
  }

  async getCartCount(): Promise<{ data: { count: number } }> {
    const { data } = await this.client.get('/cart/count');
    return data;
  }

  // Checkout & Orders
  async checkout(
    form: CheckoutForm
  ): Promise<{
    data: { order: Order; payment: Record<string, unknown> };
  }> {
    const { data } = await this.client.post('/checkout', form);
    return data;
  }

  async getOrder(orderNumber: string): Promise<{ data: Order }> {
    const { data } = await this.client.get(`/orders/${orderNumber}`);
    return data;
  }

  async getMyOrders(): Promise<PaginatedResponse<Order>> {
    const { data } = await this.client.get('/orders');
    return data;
  }

  // Admin
  async getAdminMetrics(): Promise<{ data: AdminMetrics }> {
    const { data } = await this.client.get('/admin/dashboard/metrics');
    return data;
  }

  async getAdminOrders(filters?: Record<string, string>): Promise<PaginatedResponse<Order>> {
    const { data } = await this.client.get('/admin/orders', { params: filters });
    return data;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    await this.client.put(`/admin/orders/${orderId}/status`, { status });
  }

  async getAdminProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await this.client.get('/admin/products', { params: filters });
    return data;
  }

  async createProduct(productData: {
    sku: string;
    name: string;
    slug?: string;
    description?: string;
    images?: string[];
    price: number;
    compare_at_price?: number;
    cost_price?: number;
    stock_quantity?: number;
    low_stock_threshold?: number;
    is_active?: boolean;
    attributes?: Record<string, string[]>;
    weight?: number;
    categories?: number[];
  }): Promise<{ data: Product; message: string }> {
    const { data } = await this.client.post('/admin/products', productData);
    return data;
  }

  async getCategories(): Promise<{ data: Category[] }> {
    const { data } = await this.client.get('/categories');
    return data;
  }
}

export const api = new ApiClient();
