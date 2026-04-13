import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';

export default function Orders({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [available, setAvailable] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<'available' | 'mine'>('available');

  const loadAvailable = async () => {
  const res = await fetch(`${API_URL}/orders/available`);
  setAvailable(await res.json());
};

const loadMyOrders = async () => {
  const res = await fetch(`${API_URL}/orders/delivery/${user.id}`);
  setMyOrders(await res.json());
};

  useEffect(() => {
  const loadAvailable = async () => {
    const res = await fetch(`${API_URL}/orders/available`);
    setAvailable(await res.json());
  };

  const loadMyOrders = async () => {
    const res = await fetch(`${API_URL}/orders/delivery/${user.id}`);
    setMyOrders(await res.json());
  };

  const init = async () => {
    await loadAvailable();
    await loadMyOrders();
  };

  init();
    }, [user.id]);
  const handleOrder = async (orderId: string, status: 'ACCEPTED' | 'DECLINED') => {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        deliveryId: status === 'ACCEPTED' ? user.id : undefined,
      }),
    });
    loadAvailable();
    loadMyOrders();
  };

  const markDelivered = async (orderId: string) => {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    loadMyOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-amber-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
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

      <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1  gap-8 mb-8">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'available'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'}`}>
            DISPONIBLES ({available.length})
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'mine'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
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
                      onClick={() => handleOrder(order.id, 'ACCEPTED')}
                      className="flex-1 bg-amber-600 text-white py-3.5 rounded-2xl font-black hover:bg-amber-700 active:scale-95 transition">
                      ACEPTAR
                    </button>
                    <button
                      onClick={() => handleOrder(order.id, 'DECLINED')}
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
          myOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <div className="text-5xl mb-4"></div>
              <p className="font-medium">No tienes entregas asignadas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 text-lg">{order.stores?.name}</p>
                      <p className="text-gray-400 text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black
                      ${order.status === 'ACCEPTED' || order.status === 'En entrega'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mb-5 bg-gray-50 rounded-2xl p-4">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-sm text-gray-600 font-medium">
                        • {item.products?.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  {(order.status === 'ACCEPTED' || order.status === 'En entrega') && (
                    <button
                      onClick={() => markDelivered(order.id)}
                      className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black hover:bg-orange-600 active:scale-95 transition shadow-lg shadow-orange-200">
                      MARCAR COMO ENTREGADO
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}