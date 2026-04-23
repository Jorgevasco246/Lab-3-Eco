import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import { CreateOrderDTO, CreateOrderItemDTO } from './order.types'

const normalizePoint = (
  point:
    | { x?: number; y?: number }
    | { type?: string; coordinates?: number[] }
    | string
    | null
    | undefined,
) => {
  if (!point) {
    return null;
  }

  if (typeof point === 'string') {
    const match = point.match(/POINT\(([-0-9.]+)\s+([-0-9.]+)\)/i);

    if (match) {
      return {
        lng: Number.parseFloat(match[1]),
        lat: Number.parseFloat(match[2]),
      };
    }

    return null;
  }

  const geoPoint = point as { type?: string; coordinates?: number[] };

  if (
    geoPoint.type === 'Point' &&
    Array.isArray(geoPoint.coordinates) &&
    geoPoint.coordinates.length >= 2
  ) {
    return {
      lng: Number(geoPoint.coordinates[0]),
      lat: Number(geoPoint.coordinates[1]),
    };
  }

  const xyPoint = point as { x?: number; y?: number };

  if (typeof xyPoint.x !== 'number' || typeof xyPoint.y !== 'number') {
    return null;
  }

  return {
    lng: xyPoint.x,
    lat: xyPoint.y,
  };
};

const normalizeOrder = <
  T extends {
    destination?:
      | { x?: number; y?: number }
      | { type?: string; coordinates?: number[] }
      | string
      | null;
    delivery_position?:
      | { x?: number; y?: number }
      | { type?: string; coordinates?: number[] }
      | string
      | null;
  },
>(
  order: T,
) => ({
  ...order,
  destination: normalizePoint(order.destination),
  delivery_position: normalizePoint(order.delivery_position),
});

const loadSpatialFieldsByOrderIds = async (orderIds: string[]) => {
  if (orderIds.length === 0) {
    return new Map<string, { destination: { lat: number; lng: number } | null; delivery_position: { lat: number; lng: number } | null }>();
  }

  const { rows } = await pool.query<{
    id: string;
    destination_lat: number | null;
    destination_lng: number | null;
    delivery_position_lat: number | null;
    delivery_position_lng: number | null;
  }>(
    `
      select
        id,
        ST_Y(destination::geometry) as destination_lat,
        ST_X(destination::geometry) as destination_lng,
        ST_Y(delivery_position::geometry) as delivery_position_lat,
        ST_X(delivery_position::geometry) as delivery_position_lng
      from orders
      where id = any($1::uuid[])
    `,
    [orderIds],
  );

  return new Map(
    rows.map((row) => [
      row.id,
      {
        destination:
          row.destination_lat !== null && row.destination_lng !== null
            ? { lat: Number(row.destination_lat), lng: Number(row.destination_lng) }
            : null,
        delivery_position:
          row.delivery_position_lat !== null && row.delivery_position_lng !== null
            ? {
                lat: Number(row.delivery_position_lat),
                lng: Number(row.delivery_position_lng),
              }
            : null,
      },
    ]),
  );
};

const withSpatialFields = async <
  T extends {
    id: string;
    destination?: unknown;
    delivery_position?: unknown;
  },
>(
  orders: T[],
) => {
  const spatialById = await loadSpatialFieldsByOrderIds(orders.map((order) => order.id));

  return orders.map((order) => {
    const spatial = spatialById.get(order.id);

    return {
      ...normalizeOrder(order as any),
      destination: spatial?.destination ?? normalizePoint(order.destination as any),
      delivery_position:
        spatial?.delivery_position ?? normalizePoint(order.delivery_position as any),
    };
  });
};

const withSpatialField = async <
  T extends {
    id: string;
    destination?: unknown;
    delivery_position?: unknown;
  },
>(
  order: T,
) => {
  const [normalized] = await withSpatialFields([order]);
  return normalized;
};

export const createOrderService = async (data: CreateOrderDTO) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query<{
      id: string;
      consumerId: string;
      storeId: string;
      deliveryId: string | null;
      status: string;
      destination: unknown;
      delivery_position: unknown;
      createdAt: string;
    }>(
      `
        insert into orders ("consumerId", "storeId", status, destination)
        values (
          $1,
          $2,
          'Creado',
          ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
        )
        returning *
      `,
      [
        data.consumerId,
        data.storeId,
        data.destination?.lng ?? null,
        data.destination?.lat ?? null,
      ],
    );

    const order = orderResult.rows[0];

    for (const item of data.items) {
      await client.query(
        `
          insert into order_items ("orderId", "productId", quantity)
          values ($1, $2, $3)
        `,
        [order.id, item.productId, item.quantity],
      );
    }

    await client.query('COMMIT');

    return withSpatialField(order);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOrdersByConsumerService = async (consumerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(*, products(name, price))')
    .eq('consumerId', consumerId);
  if (error) throw new Error(error.message);
  return withSpatialFields(data);
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

  return withSpatialFields(data);
};


export const getAcceptedOrdersByDeliveryService = async (deliveryId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(quantity, products(name, price))')
    .eq('deliveryId', deliveryId);

  if (error) throw new Error(error.message);

  return withSpatialFields(data);
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
  return withSpatialField(data);
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
  return withSpatialField(data);
};

export const updatePositionService = async (orderId: string, lat: number, lng: number) => {
  const { rows } = await pool.query<{
    id: string;
    consumerId: string;
    storeId: string;
    deliveryId: string | null;
    status: string;
    destination: unknown;
    delivery_position: unknown;
    createdAt: string;
  }>(
    `
      update orders
      set delivery_position = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
      where id = $1
      returning *
    `,
    [orderId, lng, lat],
  );

  if (!rows[0]) {
    throw new Error('Order not found');
  }

  return withSpatialField(rows[0]);
};

export const getOrderByIdService = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(quantity, products(name, price))')
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);

  return withSpatialField(data);
};
export const checkArrivalService = async (orderId: string, lat: number, lng: number) => {
  await pool.query(
    `
      update orders
      set delivery_position = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
      where id = $1
    `,
    [orderId, lng, lat],
  );

  const { rows } = await pool.query<{ arrived: boolean }>(
    `
      select ST_DWithin(delivery_position, destination, 5) as arrived
      from orders
      where id = $1
    `,
    [orderId],
  );

  const arrived = Boolean(rows[0]?.arrived);

  if (arrived) {
    await pool.query(
      `
        update orders
        set status = 'Entregado'
        where id = $1
      `,
      [orderId],
    );
  }

  return arrived;
};
