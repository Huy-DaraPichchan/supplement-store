export type ProductBadge = "Vegan" | "Lab Tested" | "Best Seller" | "New";
 
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  badges: Array<ProductBadge | "In stock" | "Sold out">;
  slug: string;
  sku: string;
  stock: number;
  priceKhr: number | null;
}
 
