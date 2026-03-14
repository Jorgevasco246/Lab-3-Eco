export interface Product {
  id: string; // UUID
  name: string;
  price: number;
  storeId: string; // FK
}

// Lo que el usuario envía para crear un producto
export interface CreateProductDTO {
  name: string;
  price: number;
  storeId: string; 
}