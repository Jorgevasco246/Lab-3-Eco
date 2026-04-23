import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import 'leaflet/dist/leaflet.css';

export type User = { id: string; name: string; email: string; role: string };

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (u: User) => {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (showRegister)
      return <Register onSuccess={() => setShowRegister(false)} onLogin={() => setShowRegister(false)} />;
    return <Login onSuccess={handleLogin} onRegister={() => setShowRegister(true)} />;
  }

  return <Orders user={user} onLogout={handleLogout} />;
}

export default App;