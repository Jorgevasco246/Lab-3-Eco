import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';
import TrackingMap from '../components/TrackingMap';

export default function MyOrders({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [arrivedOrders, setArrivedOrders] = useState<Set<string>>(new Set());

  const loadOrders = useCallback(async () => {
    const res = await fetch(`${API_URL}/orders/consumer/${user.id}`);
    const data = await res.json();
    setOrders(data);
  }, [user.id]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const getDestination = (order: any) => {
    if (!order.destination) return null;

    if (typeof order.destination === 'object') {
      if (typeof order.destination.lat === 'number' && typeof order.destination.lng === 'number') {
        return order.destination;
      }

      if (typeof order.destination.y === 'number' && typeof order.destination.x === 'number') {
        return { lat: order.destination.y, lng: order.destination.x };
      }

      if (
        order.destination.type === 'Point' &&
        Array.isArray(order.destination.coordinates) &&
        order.destination.coordinates.length >= 2
      ) {
        return {
          lat: Number(order.destination.coordinates[1]),
          lng: Number(order.destination.coordinates[0]),
        };
      }
    }

    if (typeof order.destination === 'string') {
      const match = order.destination.match(/POINT\(([-0-9.]+)\s+([-0-9.]+)\)/i);
      if (match) {
        return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
      }
    }

    return null;
  };

  const formatDestination = (order: any) => {
    const destination = getDestination(order);

    if (!destination) {
      return 'Destino no disponible';
    }

    return `Lat ${destination.lat.toFixed(5)}, Lng ${destination.lng.toFixed(5)}`;
  };

  const statusColor: Record<string, string> = {
    Creado: 'bg-yellow-100 text-yellow-700',
    'En entrega': 'bg-orange-100 text-orange-600',
    Entregado: 'bg-green-100 text-green-600',
    Rechazado: 'bg-red-100 text-red-500',
  };

  const handleArrived = useCallback((orderId: string) => {
    setArrivedOrders((prev) => new Set([...prev, orderId]));
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 mb-8">Mis Pedidos</h2>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <div className="text-5xl mb-4">Pedidos</div>
            <p className="font-medium">No tienes pedidos aun</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-black text-gray-900">{order.stores?.name}</p>
                    <p className="text-gray-400 text-xs font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-gray-50 rounded-2xl p-4 mb-4">
                  {order.order_items?.map((item: any) => (
                    <p key={item.id} className="text-sm text-gray-600 font-medium">
                      - {item.products?.name} x{item.quantity} - ${item.products?.price * item.quantity}
                    </p>
                  ))}
                </div>

                <div className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  Punto de entrega: {formatDestination(order)}
                </div>

                {order.status === 'En entrega' && (
                  <div className="mt-4">
                    <p className="font-black text-gray-700 mb-3 text-sm">
                      Tracking en tiempo real
                    </p>
                    {arrivedOrders.has(order.id) && (
                      <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-2xl font-black text-center mb-3">
                        El repartidor ha llegado!
                      </div>
                    )}
                    <TrackingMap
                      orderId={order.id}
                      destination={getDestination(order)}
                      onArrived={() => handleArrived(order.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
