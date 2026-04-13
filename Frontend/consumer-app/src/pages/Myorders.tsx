import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';

export default function MyOrders({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/orders/consumer/${user.id}`)
      .then(r => r.json())
      .then(setOrders);
  }, [user.id]);

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1 gap-8 mb-8 px-6 py-8 md:px-16  gap-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">Mis Pedidos</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400">No tienes pedidos aún</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-white border rounded-2xl p-5 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-gray-700">Tienda: {order.stores?.name}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {order.order_items?.map((item: any) => (
                <p key={item.id}>{item.products?.name} x{item.quantity} — ${item.products?.price * item.quantity}</p>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}