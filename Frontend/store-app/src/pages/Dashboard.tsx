import { useEffect, useState, useCallback } from 'react';
import { API_URL, supabase } from '../api/config';
import type { User } from '../App';

interface Store { id: string; name: string; isOpen: boolean; }
interface Product { id: string; name: string; price: number; }

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [tab, setTab] = useState<'products' | 'orders'>('products');

  const loadProducts = useCallback(async (storeId: string) => {
    const res = await fetch(`${API_URL}/products/store/${storeId}`);
    setProducts(await res.json());
  }, []);

  const loadOrders = useCallback(async (storeId: string) => {
    const res = await fetch(`${API_URL}/orders/store/${storeId}`);
    setOrders(await res.json());
  }, []);

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`${API_URL}/stores/my-store/${user.id}`);
      const data = await res.json();
      setStore(data);
      await loadProducts(data.id);
      await loadOrders(data.id);

      // Suscripción en tiempo real a cambios de órdenes
      const channel = supabase
        .channel(`store-orders:${data.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `storeId=eq.${data.id}`,
        }, () => {
          loadOrders(data.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    init();
  }, [user.id, loadProducts, loadOrders]);

  const toggleStore = async () => {
    if (!store) return;
    const res = await fetch(`${API_URL}/stores/${store.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: !store.isOpen }),
    });
    const updated = await res.json();
    setStore(updated);
  };

  const createProduct = async () => {
    if (!store || !newProduct.name || !newProduct.price) return;
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProduct.name, price: Number(newProduct.price), storeId: store.id }),
    });
    setNewProduct({ name: '', price: '' });
    loadProducts(store.id);
  };

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400 text-lg font-medium">Cargando tienda...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-8 py-5 flex justify-between items-center shadow-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-black text-xl tracking-tight">{store.name}</h1>
          <span className={`text-sm font-bold ${store.isOpen ? 'text-green-400' : 'text-red-400'}`}>
            {store.isOpen ? '● Abierta' : '● Cerrada'}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={toggleStore}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition active:scale-95
              ${store.isOpen
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'}`}>
            {store.isOpen ? 'CERRAR' : 'ABRIR'}
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl font-black text-sm bg-white/10 hover:bg-white/20 transition">
            SALIR
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setTab('products')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'products'
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'}`}>
            PRODUCTOS
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-6 py-4 rounded-2xl font-black text-sm transition
              ${tab === 'orders'
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border-2 border-gray-100'}`}>
            PEDIDOS ({orders.length})
          </button>
        </div>

        {tab === 'products' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-gray-900 mb-5 text-lg">Agregar Producto</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl focus:outline-none focus:border-gray-900 transition font-medium"
                  placeholder="  Nombre del producto"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input
                  className="w-full sm:w-36 border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl focus:outline-none focus:border-gray-900 transition font-medium"
                  placeholder="  Precio"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <button
                  onClick={createProduct}
                  className="bg-gray-900 text-white px-6 py-4 rounded-2xl hover:bg-gray-800 active:scale-95 transition font-black shadow-lg shadow-gray-200">
                  + AGREGAR
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <div className="text-5xl mb-4">📦</div>
                <p className="font-medium">No hay productos aún</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-6 py-5 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                    <span className="font-bold text-gray-800">{p.name}</span>
                    <span className="text-gray-900 font-black text-xl">${p.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <div className="text-5xl mb-4">🧾</div>
                <p className="font-medium">No hay pedidos aún</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-black text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-gray-400 text-sm font-medium">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black
                      ${order.status === 'Creado'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'En entrega'
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