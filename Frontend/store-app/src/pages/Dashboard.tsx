import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';

interface Store { id: string; name: string; isOpen: boolean; }
interface Product { id: string; name: string; price: number; }

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [tab, setTab] = useState<'products' | 'orders'>('products');

  const loadProducts = async (storeId: string) => {
    const res = await fetch(`${API_URL}/products/store/${storeId}`);
    setProducts(await res.json());
  };

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`${API_URL}/stores/my-store/${user.id}`);
      const data = await res.json();
      setStore(data);

      const prodRes = await fetch(`${API_URL}/products/store/${data.id}`);
      setProducts(await prodRes.json());

      const ordRes = await fetch(`${API_URL}/orders/store/${data.id}`);
      setOrders(await ordRes.json());
    };
    init();
  }, [user.id]);

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
      <p className="text-gray-400 text-lg">Cargando tienda...</p>
    </div>
  );

  return (
    <div className="mx-auto min-h-screen bg-gray-50 ">
      {/* Navbar */}
      <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-xl">Bienvenido, {store.name}</h1>
          <span className={`text-sm ${store.isOpen ? 'text-green-200' : 'text-red-200'}`}>
            {store.isOpen ? '🟢 Abierta' : '🔴 Cerrada'}
          </span>
        </div>
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={toggleStore}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition active:scale-95
              ${store.isOpen
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/20'
                : 'bg-green-400 hover:bg-green-500 shadow-lg shadow-green-900/20'}`}>
            {store.isOpen ? '🔴 Cerrar Tienda' : '🟢 Abrir Tienda'}
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/20 hover:bg-white/30 transition">
            Salir
          </button>
        </div>
      </nav>

      <div className="justify-center mx-8 px-6 py-8 md:px-16 mx-auto grid grid-cols-1 gap-8 mb-8 px-6 py-8 md:px-16  gap-8 mb-8">

        {/* Tabs */}
        <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <button
            onClick={() => setTab('products')}
            className={`px-6 py-3 rounded-xl font-semibold transition
              ${tab === 'products'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
            📦 Productos
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-6 py-3 rounded-xl font-semibold transition
              ${tab === 'orders'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
            🧾 Pedidos ({orders.length})
          </button>
        </div>

        {/* Productos */}
        {tab === 'products' && (
          <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1 gap-8 mb-8 px-6 py-8 md:px-16  gap-8 mb-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4 text-lg">Agregar Producto</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="  Nombre del producto"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input
                  className="w-full sm:w-36 border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="  Precio"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <button
                  onClick={createProduct}
                  className="bg-green-600 text-white px-6 py-3.5 rounded-xl hover:bg-green-700 active:scale-95 transition font-semibold flex items-center justify-center shadow-lg shadow-green-200">
                  + Agregar
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">📦</div>
                <p>No hay productos aún</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="text-green-600 font-bold text-lg">${p.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pedidos */}
        {tab === 'orders' && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🧾</div>
                <p>No hay pedidos aún</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-gray-700">Pedido #{order.id.slice(0, 8)}</p>
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mb-3">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-sm text-gray-600">
                        • {item.products?.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}