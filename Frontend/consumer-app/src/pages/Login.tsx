import { useState } from 'react';
import { API_URL } from '../api/config';

interface Props {
  onSuccess: (user: any) => void;
  onRegister: () => void;
  onBack?: () => void;
}

export default function Login({ onSuccess, onRegister, onBack }: Props) {
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
      onSuccess(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
            ← Volver
          </button>
        )}
        <h2 className="text-2xl font-bold text-orange-600 mb-2 text-center">Iniciar Sesión</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Portal exclusivo para consumidores</p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <input className="w-full border p-3 rounded-xl mb-3" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-3 rounded-xl mb-4" placeholder="Contraseña"
          type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600">
          Entrar
        </button>
        <p className="text-center mt-4 text-gray-500">
          ¿No tienes cuenta?{' '}
          <button onClick={onRegister} className="text-orange-500 font-semibold">Regístrate</button>
        </p>
      </div>
    </div>
  );
}