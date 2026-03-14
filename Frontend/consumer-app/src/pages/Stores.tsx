import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';

interface Store { id: string; name: string; isOpen: boolean; }
interface Product { id: string; name: string; price: number; }

export default function Stores({ user }: { user: User }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/stores`)
      .then(r => r.json())
      .then(setStores);
  }, []);

  const selectStore = async (store: Store) => {
    setSelectedStore(store);
    setCart([]);
    const res = await fetch(`${API_URL}/products/store/${store.id}`);
    setProducts(await res.json());
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const placeOrder = async () => {
    if (!selectedStore || cart.length === 0) return;
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumerId: user.id,
        storeId: selectedStore.id,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.qty })),
      }),
    });
    if (res.ok) {
      setMsg('¡Pedido creado exitosamente!');
      setCart([]);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4">Tiendas</h2>
          {stores.map(store => (
            <div key={store.id}
              onClick={() => store.isOpen && selectStore(store)}
              className={`p-4 rounded-xl mb-3 border cursor-pointer transition
                ${selectedStore?.id === store.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                ${!store.isOpen ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-300'}`}>
              <p className="font-semibold">{store.name}</p>
              <span className={`text-sm ${store.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                {store.isOpen ? '● Abierta' : '● Cerrada'}
              </span>
            </div>
          ))}
        </div>

        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4">
            {selectedStore ? `Productos - ${selectedStore.name}` : 'Selecciona una tienda'}
          </h2>
          {products.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border rounded-xl mb-2">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-orange-600 font-semibold">${p.price}</p>
              </div>
              <button onClick={() => addToCart(p)}
                className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600">
                +
              </button>
            </div>
          ))}
        </div>

        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4">Carrito</h2>
          {cart.length === 0 ? (
            <p className="text-gray-400">Tu carrito está vacío</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between p-2 border-b">
                  <span>{item.product.name} x{item.qty}</span>
                  <span className="text-orange-600">${item.product.price * item.qty}</span>
                </div>
              ))}
              <div className="mt-3 font-bold text-right">
                Total: ${cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)}
              </div>
              <button onClick={placeOrder}
                className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600">
                Hacer Pedido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}