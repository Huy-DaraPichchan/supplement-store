export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type OrderItem = {
  product_id: string | null;
  product_name: string;
  product_sku: string;
  image_url: string | null;
  quantity: number;
  unit_price_usd_cents: number;
  line_total_usd_cents: number;
  unit_price_khr: number;
  line_total_khr: number;
};

export type Order = {
  id: string;
  order_number: string;
  public_token: string;
  status: OrderStatus;
  selected_channels: string;
  display_currency: "USD" | "KHR";
  exchange_rate: string | number;
  total_usd_cents: number;
  total_khr: number;
  created_at: string;
  items: OrderItem[];
};
