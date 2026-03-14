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
    <div>
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">🚴 Rappi Delivery</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm">Hola, {user.name}</span>
          <button onClick={onLogout} className="hover:underline text-sm">Salir</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('available')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            Disponibles ({available.length})
          </button>
          <button onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            Mis Entregas ({myOrders.length})
          </button>
        </div>

        {tab === 'available' && (
          available.length === 0 ? (
            <p className="text-gray-400">No hay pedidos disponibles</p>
          ) : (
            available.map(order => (
              <div key={order.id} className="bg-white border rounded-2xl p-5 mb-4 shadow-sm">
                <p className="font-semibold mb-1">Tienda: {order.stores?.name}</p>
                <div className="text-sm text-gray-600 mb-3">
                  {order.order_items?.map((item: any) => (
                    <p key={item.id}>{item.products?.name} x{item.quantity}</p>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleOrder(order.id, 'ACCEPTED')}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 font-medium">
                    ✓ Aceptar
                  </button>
                  <button onClick={() => handleOrder(order.id, 'DECLINED')}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl hover:bg-red-200 font-medium">
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {tab === 'mine' && (
          myOrders.length === 0 ? (
            <p className="text-gray-400">No tienes entregas asignadas</p>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="bg-white border rounded-2xl p-5 mb-4 shadow-sm">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">Tienda: {order.stores?.name}</p>
                  <span className={`px-3 py-1 rounded-full text-sm
                    ${order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </span>
                </div>
                {order.order_items?.map((item: any) => (
                  <p key={item.id} className="text-sm text-gray-600">
                    {item.products?.name} x{item.quantity}
                  </p>
                ))}
                {order.status === 'ACCEPTED' && (
                  <button onClick={() => markDelivered(order.id)}
                    className="w-full mt-3 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 font-medium">
                    Marcar como Entregado
                  </button>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}