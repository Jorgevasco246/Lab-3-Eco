import { useEffect, useState } from 'react';
import { API_URL, supabase } from '../api/config';
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
    setMyOrders(await res.json());
  };

  useEffect(() => {
    const init = async () => {
      await loadAvailable();
      await loadMyOrders();
    };
    init();
  }, [user.id]);

  const handleAccept = async (order: any) => {
    const res = await fetch(`${API_URL}/orders/${order.id}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryId: user.id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveOrder(updated);
      setTab('mine');
      loadAvailable();
      loadMyOrders();
    }
  };

  const handleDecline = async (orderId: string) => {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rechazado' }),
    });
    loadAvailable();
  };

  const handleDelivered = async () => {
    setActiveOrder(null);
    loadMyOrders();
  };

  const getDestination = (order: any) => {
    if (!order.destination) return null;
    // Supabase devuelve POINT(lng lat)
    const match = order.destination.match(/POINT\(([^ ]+) ([^ )]+)\)/);
    if (!match) return null;
    return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-black text-xl tracking-tight">RAPPI DELIVERY</h1>
          <span className="text-orange-200 text-sm">Hola, {user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl font-black text-sm bg-white/20 hover:bg-white/30 transition">
          SALIR
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'available'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'}`}>
            DISPONIBLES ({available.length})
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'mine'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'}`}>
            MIS ENTREGAS ({myOrders.length})
          </button>
        </div>

        {/* Pedidos disponibles */}
        {tab === 'available' && (
          available.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <div className="text-5xl mb-4">📦</div>
              <p className="font-medium">No hay pedidos disponibles</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {available.map(order => (
                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="mb-4">
                    <p className="font-black text-gray-900 text-lg">{order.stores?.name}</p>
                    <p className="text-gray-400 text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
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
                      className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl font-black hover:bg-gray-800 active:scale-95 transition">
                      ACEPTAR
                    </button>
                    <button
                      onClick={() => handleDecline(order.id)}
                      className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 active:scale-95 transition">
                      RECHAZAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Mis entregas */}
        {tab === 'mine' && (
          <div className="flex flex-col gap-4">
            {/* Mapa activo si hay orden en entrega */}
            {activeOrder && (
              <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-black text-gray-900 text-lg">{activeOrder.stores?.name}</p>
                    <p className="text-orange-500 font-bold text-sm">En entrega</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-orange-100 text-orange-600">
                    EN ENTREGA
                  </span>
                </div>
                <DeliveryMap
                  orderId={activeOrder.id}
                  userId={user.id}
                  destination={getDestination(activeOrder)}
                  onDelivered={handleDelivered}
                />
              </div>
            )}

            {myOrders.length === 0 && !activeOrder ? (
              <div className="text-center py-20 text-gray-300">
                <div className="text-5xl mb-4">🚴</div>
                <p className="font-medium">No tienes entregas asignadas</p>
              </div>
            ) : (
              myOrders
                .filter(o => o.status !== 'En entrega')
                .map(order => (
                  <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-gray-900 text-lg">{order.stores?.name}</p>
                        <p className="text-gray-400 text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black
                        ${order.status === 'En entrega'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-green-100 text-green-600'}`}>
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
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}