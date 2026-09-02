export type ProductBadge = "Vegan" | "Lab Tested" | "Best Seller" | "New";
 
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  badges: ProductBadge[];
}
 