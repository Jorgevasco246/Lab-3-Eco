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

  const closeStore = () => {
    setSelectedStore(null);
    setProducts([]);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const placeOrder = async () => {
    if (!selectedStore || cart.length === 0) return;

    if (!selectedStore.isOpen) {
      setMsg('La tienda está cerrada, no puedes hacer pedidos');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

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
      setMsg('✅ ¡Pedido creado exitosamente!');
      setCart([]);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {msg && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-medium
          ${msg.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <br />


        {/* Tiendas */}
<div className="col-span-1">
  <h2 className="text-xl font-bold mb-2">🏪 Tiendas</h2>
  <p className="text-gray-400 text-sm mb-4">Selecciona una tienda:</p>
  {stores.map(store => (
    <button
      key={store.id}
      onClick={() => store.isOpen && selectStore(store)}
      disabled={!store.isOpen}
      className={`w-full text-left p-5 rounded-xl mb-5 transition font-medium flex justify-between items-center
        ${selectedStore?.id === store.id
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
          : store.isOpen
            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
            : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60'}`}>
      <span>{store.name}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full
        ${selectedStore?.id === store.id
          ? 'bg-white/20 text-white'
          : store.isOpen
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-500'}`}>
        {store.isOpen ? '🟢 Abierta' : '🔴 Cerrada'}
      </span>
    </button>
  ))}
</div>

        {/* Productos */}
        <div className="col-span-1">
          {selectedStore ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Aqui estan los productos de {selectedStore.name}</h2>
                <button
                  onClick={closeStore}
                  className="text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition border border-gray-200 hover:border-red-200">
                  ✕ Cerrar
                </button>
              </div>
              {products.length === 0 ? (
                <p className="text-gray-400 text-sm">Esta tienda no tiene productos aún</p>
              ) : (
                products.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition">
                    <div>
                      <p className="font-medium text-gray-700">{p.name}</p>
                      <p className="text-orange-500 font-bold">${p.price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="bg-orange-500 text-white w-9 h-9 rounded-xl hover:bg-orange-600 active:scale-95 transition text-lg font-bold">
                      +
                    </button>
                  </div>
                ))
              )}
              <br />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-300">
              <div className="text-5xl mb-3"> <br />
              </div>
              <p className="text-sm">Selecciona una tienda para ver sus productos</p>
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4">🛒 Carrito</h2>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-gray-300">
              <div className="text-5xl mb-3"> <br />
              </div>
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{item.product.name}</p>
                      <p className="text-orange-500 font-semibold text-sm">x{item.qty} — ${item.product.price * item.qty}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition text-lg">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl mb-4">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-orange-600 text-lg">
                  ${cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)}
                </span>
              </div>
              <button
                onClick={placeOrder}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition shadow-lg shadow-orange-200">
                Hacer Pedido 🚀
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}