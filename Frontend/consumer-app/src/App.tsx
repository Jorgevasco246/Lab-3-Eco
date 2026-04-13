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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const saved = localStorage.getItem('user');
    return saved ? 'consumer' : null;
  });

  const handleLogin = (u: User) => {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    setPage('stores');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setSelectedRole(null);
  };

  if (!selectedRole) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full bg-orange-500 py-4 px-8">
        <h1 className="text-white font-black text-2xl tracking-tight"></h1>
      </div>

      {/* Hero */}
<div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
  <div className="w-full max-w-md mx-auto text-center flex flex-col items-center">
    <p className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-4">
      Bienvenido a
    </p>
    <h1 className="text-7xl font-black text-gray-900 mb-6 leading-none">
      RAPPI
    </h1>
    <p className="text-gray-400 text-xl mb-8">
      ¿Cuál es tu rol hoy?
    </p>
    <br />

    <div className="flex flex-col gap-5 w-full">
      <button
        onClick={() => setSelectedRole('consumer')}
        className=" w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-orange-600 active:scale-95 transition shadow-xl shadow-orange-200">
        SOY CONSUMIDOR
      </button>
      <button
        onClick={() => window.open('https://lab-3-eco-mv2m.vercel.app/', '_blank')}
        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-gray-800 active:scale-95 transition shadow-xl shadow-gray-200">
        SOY TIENDA
      </button>
      <button
        onClick={() => window.open('https://lab-3-eco-vvsl.vercel.app/', '_blank')}
        className="w-full border-4 border-gray-900 text-gray-900 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 active:scale-95 transition">
        SOY REPARTIDOR
      </button>
    </div>
  </div>
</div>

      {/* Footer strip */}
      <div className="w-full bg-gray-900 py-3 px-8 flex justify-between items-center">
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase"></p>
        <p className="text-gray-500 text-xs">Ecosistemas Lab 3</p>
      </div>
    </div>
  );
}
  if (!user) {
    if (page === 'register')
      return <Register onSuccess={() => setPage('login')} onLogin={() => setPage('login')} />;
    return (
      <Login
        onSuccess={handleLogin}
        onRegister={() => setPage('register')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div>
      <nav className="bg-orange-500 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Rappi Consumer</h1>
        <div className="flex gap-4">
          <button onClick={() => setPage('stores')} className="hover:underline">Tiendas</button>
          <button onClick={() => setPage('my-orders')} className="hover:underline">Mis Pedidos</button>
          <button onClick={handleLogout} className="hover:underline">Salir</button>
        </div>
      </nav>
      {page === 'stores' && <Stores user={user} />}
      {page === 'my-orders' && <MyOrders user={user} />}
    </div>
  );
}

export default App;