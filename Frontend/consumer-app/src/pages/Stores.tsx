import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';
import type { User } from '../App';
import MapPicker from '../components/MapPicker';

interface Store { id: string; name: string; isOpen: boolean; }
interface Product { id: string; name: string; price: number; }

export default function Stores({ user }: { user: User }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [msg, setMsg] = useState('');
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

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
    setMsg('❌ La tienda está cerrada, no puedes hacer pedidos');
    setTimeout(() => setMsg(''), 3000);
    return;
  }
  if (!destination) {
    setMsg('❌ Debes seleccionar un punto de entrega en el mapa');
    setTimeout(() => setMsg(''), 3000);
    return;
  }

  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumerId: user.id,
      storeId: selectedStore.id,
      destination,
      items: cart.map(i => ({ productId: i.product.id, quantity: i.qty })),
    }),
  });
  if (res.ok) {
    setMsg('✅ ¡Pedido creado exitosamente!');
    setCart([]);
    setDestination(null);
    setTimeout(() => setMsg(''), 3000);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-16">

      {msg && (
        <div className={`max-w-6xl mx-auto mb-6 p-4 rounded-2xl text-sm font-bold
          ${msg.startsWith('❌') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* FILA SUPERIOR: Tiendas + Productos */}
      <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* TIENDAS */}
        <div className="px-6 py-8 mx-auto text-center flex flex-col items-center bg-white rounded-3xl shadow-sm border border-gray-100 px-12 py-10">
          <h2 className="text-2xl font-black text-gray-900 mb-1">Tiendas</h2>
          <p className="text-gray-400 text-sm mb-6 font-medium ">Selecciona una tienda para ver sus productos</p>

          <div className="flex flex-col gap-3 px-6">
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => store.isOpen && selectStore(store)}
                disabled={!store.isOpen}
                className={`w-full text-left px-5 py-4 rounded-2xl transition font-semibold flex justify-between items-center
                  ${selectedStore?.id === store.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : store.isOpen
                      ? 'bg-gray-50 border-2 border-gray-100 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                      : 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                <span>{store.name}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full
                  ${selectedStore?.id === store.id
                    ? 'bg-white/20 text-white'
                    : store.isOpen
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-400'}`}>
                  {store.isOpen ? '● Abierta' : '● Cerrada'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mapa de entrega */}
<div className="mb-4">
  <button
    onClick={() => setShowMap(!showMap)}
    className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl font-bold text-sm hover:border-orange-300 hover:text-orange-400 transition mb-3">
    {destination ? '📍 Cambiar ubicación de entrega' : '+ Seleccionar punto de entrega'}
  </button>
  {showMap && (
    <MapPicker position={destination} onSelect={(pos) => {
      setDestination(pos);
    }} />
  )}
  {destination && (
    <p className="text-xs text-gray-400 mt-2 text-center font-medium">
      Lat: {destination.lat.toFixed(4)}, Lng: {destination.lng.toFixed(4)}
    </p>
  )}
</div>

        {/* PRODUCTOS */}
        <div className=" bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
          {selectedStore ? (
            <>
              <div className="text-center flex flex-col justify-items-center-safe px-6 py-8 items-center mb-6 px-6 py-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedStore.name}</h2>
                  <p className="text-gray-400 text-sm font-medium">Productos disponibles</p>
                  <button
                  onClick={closeStore}
                  className=" justify-items-end text-gray-300 hover:text-red-400 font-black text-lg transition px-3 py-1 rounded-xl hover:bg-red-50">
                  ✕
                </button>
                </div>
                
              </div>

              {products.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
                  Esta tienda no tiene productos aún
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {products.map(p => (
                    <div key={p.id}
                      className="flex justify-between items-center px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-orange-200 transition">
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-orange-500 font-black text-lg">${p.price}</p>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="bg-orange-500 text-white w-10 h-10 rounded-2xl font-black text-xl hover:bg-orange-600 active:scale-95 transition shadow-md shadow-orange-200">
                        +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="text-5xl mb-4"></div>
              <p className="text-gray-300 font-medium">Selecciona una tienda para ver sus productos</p>
            </div>
          )}
        </div>
      </div>
          <br />
      {/* CARRITO ABAJO CENTRADO */}
      <div className="justify-center px-6 py-8 md:px-16 mx-auto grid grid-cols-1 gap-8 mb-8 px-6 py-8 md:px-16 m md:grid-cols-2 gap-8 mb-8">
        <h2 className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-2xl font-black text-gray-900 mb-6">Carrito</h2>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-5xl mb-4"><br /></div>
            <p className="text-gray-300 font-medium">Tu carrito está vacío</p>
          </div>
          
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {cart.map(item => (
                <div key={item.product.id}
                  className="flex justify-between items-center px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.product.name}</p>
                    <p className="text-orange-500 font-black">
                      x{item.qty} — ${item.product.price * item.qty}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-300 hover:text-red-400 font-black text-lg transition px-3 py-1 rounded-xl hover:bg-red-50">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            

            <div className="flex justify-between items-center px-5 py-4 bg-orange-50 rounded-2xl mb-6">
              <span className="font-black text-gray-700">TOTAL</span>
              <span className="font-black text-orange-500 text-2xl">
                ${cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)}
              </span>
            </div>

            <button
              onClick={placeOrder}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 active:scale-95 transition shadow-xl shadow-orange-200">
              HACER PEDIDO
            </button>
          </>
        )}
      </div>
    </div>
  );
}
