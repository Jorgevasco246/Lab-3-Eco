import { supabase } from '../../config/supabase';
import { CreateOrderDTO, CreateOrderItemDTO } from './order.types'

export const createOrderService = async (data: CreateOrderDTO) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{ 
      consumerId: data.consumerId, 
      storeId: data.storeId, 
      status: 'Creado',
      destination: data.destination 
        ? `POINT(${data.destination.lng} ${data.destination.lat})`
        : null
    }])
    .select().single();
  if (orderError) throw new Error(orderError.message);

  const items = data.items.map((i: CreateOrderItemDTO) => ({ 
    orderId: order.id, 
    productId: i.productId, 
    quantity: i.quantity 
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(items);
  if (itemsError) throw new Error(itemsError.message);

  return order;
};

export const getOrdersByConsumerService = async (consumerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(*, products(name, price))')
    .eq('consumerId', consumerId);
  if (error) throw new Error(error.message);
  return data;
};

export const getOrdersByStoreService = async (storeId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users!orders_consumerId_fkey(name), order_items(*, products(name, price))')
    .eq('storeId', storeId);
  if (error) throw new Error(error.message);
  return data;
};

export const getAvailableOrdersService = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(quantity, products(name, price))')
    .eq('status', 'Creado')
    .is('deliveryId', null);
  if (error) throw new Error(error.message);
  return data;
};
export const getAcceptedOrdersByDeliveryService = async (deliveryId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(quantity, products(name, price))')
    .eq('deliveryId', deliveryId);
  if (error) throw new Error(error.message);
  return data;
};

export const updateOrderStatusService = async (
  orderId: string, 
  status: string, 
  deliveryId?: string
) => {
  const updateData: Record<string, unknown> = { status };
  if (deliveryId) updateData.deliveryId = deliveryId;

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
export const acceptOrderService = async (orderId: string, deliveryId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      status: 'En entrega',
      deliveryId: deliveryId
    })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const updatePositionService = async (orderId: string, lat: number, lng: number) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      delivery_position: `POINT(${lng} ${lat})`
    })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getOrderByIdService = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(quantity, products(name, price))')
    .eq('id', orderId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};
export const checkArrivalService = async (orderId: string, lat: number, lng: number) => {
  const { data, error } = await supabase
    .rpc('check_arrival', {
      order_id: orderId,
      delivery_lat: lat,
      delivery_lng: lng,
    });
  if (error) throw new Error(error.message);
  return data;
};