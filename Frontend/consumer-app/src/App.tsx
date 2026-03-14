import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Stores from './pages/Stores';
import MyOrders from './pages/Myorders';

type Page = 'login' | 'register' | 'stores' | 'my-orders';
type Role = 'consumer' | 'store' | 'delivery' | null;

export type User = { id: string; name: string; email: string; role: string };

function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  // Pantalla de selección de rol
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">🛵 Rappi</h1>
          <p className="text-gray-500 mb-8">¿Cuál es tu rol?</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedRole('consumer')}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition">
              🛒 Soy Consumidor
            </button>
            <button
  onClick={() => window.open('https://lab-3-eco-mv2m.vercel.app/', '_blank')}
  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition">
  🏪 Soy Tienda
      </button>
           <button
  onClick={() => window.open('https://lab-3-eco-vvsl.vercel.app/', '_blank')}
  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition">
  🚴 Soy Repartidor
</button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (page === 'register')
      return <Register onSuccess={() => setPage('login')} onLogin={() => setPage('login')} />;
    return (
      <Login
        onSuccess={(u) => { setUser(u); setPage('stores'); }}
        onRegister={() => setPage('register')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div>
      <nav className="bg-orange-500 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">🛒 Rappi Consumer</h1>
        <div className="flex gap-4">
          <button onClick={() => setPage('stores')} className="hover:underline">Tiendas</button>
          <button onClick={() => setPage('my-orders')} className="hover:underline">Mis Pedidos</button>
          <button onClick={() => { setUser(null); setSelectedRole(null); }} className="hover:underline">Salir</button>
        </div>
      </nav>
      {page === 'stores' && <Stores user={user} />}
      {page === 'my-orders' && <MyOrders user={user} />}
    </div>
  );
}

export default App;