import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';

export type User = { id: string; name: string; email: string; role: string };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    if (showRegister)
      return <Register onSuccess={() => setShowRegister(false)} onLogin={() => setShowRegister(false)} />;
    return <Login onSuccess={setUser} onRegister={() => setShowRegister(true)} />;
  }

  return <Orders user={user} onLogout={() => setUser(null)} />;
}

export default App;