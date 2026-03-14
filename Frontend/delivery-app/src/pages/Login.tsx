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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚴</div>
          <h2 className="text-3xl font-bold text-gray-800">Bienvenido</h2>
          <p className="text-gray-400 mt-2 text-sm">Portal exclusivo para repartidores</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="correo@email.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Contraseña</label>
            <input
              className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="••••••••" type="password"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 active:scale-95 transition mt-2 shadow-lg shadow-blue-200">
            Iniciar sesión
          </button>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            ¿No tienes cuenta?{' '}
            <button onClick={onRegister}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition">
              Regístrate aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}