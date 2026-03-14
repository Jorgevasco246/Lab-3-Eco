export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  DELIVERED = 'DELIVERED',
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
  createdAt: string;
}

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  consumerId: string;
  storeId: string;
  items: CreateOrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  deliveryId?: string;
}