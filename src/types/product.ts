import { Inventory } from "./Inventory";

export interface Product {
  id: number;
  name: string;
  type: string;
  brandid: string;
  description: string;
  listprice: number;
  image: string;
  inventory: Array<Inventory>;
}

export interface CreateProductInput {
  name: string;
  type: string;
  brandid: string;
  description: string;
  listprice: number;
  image: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
} 