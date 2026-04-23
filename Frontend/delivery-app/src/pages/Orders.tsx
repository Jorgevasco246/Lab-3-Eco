import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';
import DeliveryMap from '../components/DeliveryMap';

export default function Orders({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [available, setAvailable] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  const loadAvailable = async () => {
    const res = await fetch(`${API_URL}/orders/available`);
    setAvailable(await res.json());
  };

  const loadMyOrders = async () => {
    const res = await fetch(`${API_URL}/orders/delivery/${user.id}`);
    const data = await res.json();
    setMyOrders(data);
    setActiveOrder((current: any) => {
      const currentOrder = current ? data.find((order: any) => order.id === current.id) : null;

      if (currentOrder) {
        return currentOrder;
      }

      return data.find((order: any) => order.status === 'En entrega') ?? data[0] ?? null;
    });
  };

  useEffect(() => {
    const init = async () => {
      await loadAvailable();
      await loadMyOrders();
    };

    void init();
  }, [user.id]);

  const parseDestination = (destination: any) => {
    if (!destination) return null;

    if (typeof destination === 'object') {
      if (typeof destination.lat === 'number' && typeof destination.lng === 'number') {
        return destination;
      }

      if (typeof destination.y === 'number' && typeof destination.x === 'number') {
        return { lat: destination.y, lng: destination.x };
      }

      if (
        destination.type === 'Point' &&
        Array.isArray(destination.coordinates) &&
        destination.coordinates.length >= 2
      ) {
        return {
          lat: Number(destination.coordinates[1]),
          lng: Number(destination.coordinates[0]),
        };
      }
    }

    if (typeof destination === 'string') {
      const match = destination.match(/POINT\(([-0-9.]+)\s+([-0-9.]+)\)/i);
      if (match) {
        return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
      }
    }

    return null;
  };

  const formatDestination = (destination: any) => {
    const point = parseDestination(destination);

    if (!point) {
      return 'Destino no disponible';
    }

    return `Lat ${point.lat.toFixed(5)}, Lng ${point.lng.toFixed(5)}`;
  };

  const handleAccept = async (order: any) => {
    const res = await fetch(`${API_URL}/orders/${order.id}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryId: user.id }),
    });

    const data = await res.json();

    if (res.ok) {
      setActiveOrder(data);
      setTab('mine');
      await loadAvailable();
      await loadMyOrders();
    }
  };

  const handleDecline = async (orderId: string) => {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rechazado' }),
    });

    await loadAvailable();
  };

  const handleDelivered = async () => {
    if (activeOrder) {
      await fetch(`${API_URL}/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Entregado', deliveryId: user.id }),
      });
    }

    setActiveOrder(null);
    await loadMyOrders();
  };

  const destination = parseDestination(activeOrder?.destination);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-black text-xl tracking-tight">RAPPI DELIVERY</h1>
          <span className="text-orange-200 text-sm">Hola, {user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl font-black text-sm bg-white/20 hover:bg-white/30 transition"
        >
          SALIR
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition ${
              tab === 'available'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'
            }`}
          >
            DISPONIBLES ({available.length})
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition ${
              tab === 'mine'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'
            }`}
          >
            MIS ENTREGAS ({myOrders.length})
          </button>
        </div>

        {tab === 'available' && (
          available.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <div className="text-5xl mb-4">📦</div>
              <p className="font-medium">No hay pedidos disponibles</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {available.map((order) => (
                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="mb-4">
                    <p className="font-black text-gray-900 text-lg">{order.stores?.name}</p>
                    <p className="text-gray-400 text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                      {formatDestination(order.destination)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 mb-5 bg-gray-50 rounded-2xl p-4">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-sm text-gray-600 font-medium">
                        • {item.products?.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(order)}
                      className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl font-black hover:bg-gray-800 active:scale-95 transition"
                    >
                      ACEPTAR
                    </button>
                    <button
                      onClick={() => handleDecline(order.id)}
                      className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 active:scale-95 transition"
                    >
                      RECHAZAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'mine' && (
          <div className="flex flex-col gap-4">
            {activeOrder && (
              <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-black text-gray-900 text-lg">{activeOrder.stores?.name}</p>
                    <p className="text-orange-500 font-bold text-sm">En entrega</p>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                      {formatDestination(activeOrder.destination)}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-orange-100 text-orange-600">
                    EN ENTREGA
                  </span>
                </div>
                <DeliveryMap
                  orderId={activeOrder.id}
                  destination={destination}
                  onDelivered={handleDelivered}
                />
                {!destination && (
                  <p className="mt-3 text-sm text-gray-500">
                    Este pedido no tiene destino cargado, pero igual puedes mover el repartidor.
                  </p>
                )}
              </div>
            )}

            {myOrders.length === 0 && !activeOrder ? (
              <div className="text-center py-20 text-gray-300">
                <div className="text-5xl mb-4">🚴</div>
                <p className="font-medium">No tienes entregas asignadas</p>
              </div>
            ) : (
              myOrders
                .filter((order) => order.id !== activeOrder?.id)
                .map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      setActiveOrder(order);
                      setTab('mine');
                    }}
                    className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm text-left hover:border-orange-200 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-gray-900 text-lg">{order.stores?.name}</p>
                        <p className="text-gray-400 text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                          {formatDestination(order.destination)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black ${
                          order.status === 'En entrega'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 bg-gray-50 rounded-2xl p-4">
                      {order.order_items?.map((item: any) => (
                        <p key={item.id} className="text-sm text-gray-600 font-medium">
                          • {item.products?.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </button>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
