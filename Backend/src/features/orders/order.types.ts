export enum OrderStatus {
  CREATED = 'Creado',
  IN_DELIVERY = 'En entrega',
  DELIVERED = 'Entregado',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: OrderStatus;
  delivery_position: unknown;
  destination: unknown;
  createdAt: string;
}

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  consumerId: string;
  storeId: string;
  destination: { lat: number; lng: number };
  items: CreateOrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  deliveryId?: string;
}

export interface UpdatePositionDTO {
  lat: number;
  lng: number;
}