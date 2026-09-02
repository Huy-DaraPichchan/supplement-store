export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export const products: Product[] = [
  { id: 1, name: "Product 1", description: "Description 1", price: 99, image: "/images/product1.jpg", category: "Electronics" },
  { id: 2, name: "Product 2", description: "Description 2", price: 149, image: "/images/product2.jpg", category: "Fashion" },
];