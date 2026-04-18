import { supabase } from '../../config/supabase';

export const createOrderService = async (data: {
  consumerId: string;
  storeId: string;
  items: { productId: string; quantity: number }[];
}) => {
  // 1. Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{ consumerId: data.consumerId, storeId: data.storeId, status: 'Creado' }])
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  // 2. Crear los items
  const itemsToInsert = data.items.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
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