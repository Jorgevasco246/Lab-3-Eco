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

  if (!store) return <p className="p-6 text-gray-500">Cargando tienda...</p>;

  return (
    <div>
      <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl">🏪 {store.name}</h1>
          <span className={`text-sm ${store.isOpen ? 'text-green-200' : 'text-red-200'}`}>
            {store.isOpen ? '● Abierta' : '● Cerrada'}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={toggleStore}
            className={`px-4 py-2 rounded-xl font-semibold text-sm
              ${store.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-400 hover:bg-green-500'}`}>
            {store.isOpen ? 'Cerrar Tienda' : 'Abrir Tienda'}
          </button>
          <button onClick={onLogout} className="hover:underline text-sm">Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'products' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
            Productos
          </button>
          <button onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
            Pedidos ({orders.length})
          </button>
        </div>

        {tab === 'products' && (
          <div>
            <div className="bg-white border rounded-2xl p-5 mb-6">
              <h3 className="font-bold mb-3">Agregar Producto</h3>
              <div className="flex gap-3">
                <input className="flex-1 border p-3 rounded-xl" placeholder="Nombre del producto"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input className="w-32 border p-3 rounded-xl" placeholder="Precio"
                  type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <button onClick={createProduct}
                  className="bg-green-600 text-white px-5 rounded-xl hover:bg-green-700">
                  Agregar
                </button>
              </div>
            </div>
            {products.length === 0 ? (
              <p className="text-gray-400">No hay productos aún</p>
            ) : (
              products.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 border rounded-xl mb-2">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-green-600 font-bold">${p.price}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <p className="text-gray-400">No hay pedidos aún</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border rounded-2xl p-5 mb-4">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      {order.status}
                    </span>
                  </div>
                  {order.order_items?.map((item: any) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.products?.name} x{item.quantity}
                    </p>
                  ))}
                  <p className="text-xs text-gray-400 mt-2">
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