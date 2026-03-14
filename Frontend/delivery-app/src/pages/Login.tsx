import { useState } from 'react';
import { API_URL } from '../api/config';

interface Props {
  onSuccess: (user: any) => void;
  onRegister: () => void;
}

export default function Login({ onSuccess, onRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.role !== 'delivery') throw new Error('Solo cuentas de delivery pueden acceder aquí');
      onSuccess(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">🚴 Delivery Login</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <input className="w-full border p-3 rounded-xl mb-3" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-3 rounded-xl mb-4" placeholder="Contraseña"
          type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
          Entrar
        </button>
        <p className="text-center mt-4 text-gray-500">
          ¿No tienes cuenta?{' '}
          <button onClick={onRegister} className="text-blue-600 font-semibold">Regístrate</button>
        </p>
        <p className="text-center text-gray-400 text-sm mb-4">
  Portal exclusivo para repartidores
</p>
      </div>
    </div>
  );
}