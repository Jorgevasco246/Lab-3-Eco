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
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 bg-amber-800 flex-col justify-between p-12">
        <div>
          <h1 className="text-white font-black text-3xl tracking-tight">RAPPI</h1>
        </div>
        <div>
          <h2 className="text-white font-black text-5xl leading-tight mb-4">
            ENTREGA<br />RÁPIDO,<br />GANA MÁS.
          </h2>
          <br />
          <p className="text-orange-200 text-lg">
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12">
        <div className="max-w-sm w-full mx-auto">
          <p className="text-orange-500 font-bold text-xs tracking-widest uppercase mb-2">
            Portal Repartidores
          </p>
          <h2 className="text-4xl font-black text-gray-900 mb-10">
            Inicia sesión
          </h2>
        <br />
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl focus:outline-none focus:border-orange-500 transition text-gray-800 font-medium"
                placeholder="  correo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl focus:outline-none focus:border-orange-500 transition text-gray-800 font-medium"
                placeholder="  ••••••••"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)} />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-amber-800 text-white py-4 rounded-2xl font-black text-lg hover:bg-amber-600 active:scale-95 transition mt-2 shadow-xl shadow-orange-200">
              INICIAR SESIÓN
            </button>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onRegister}
                className="text-amber-800 font-black hover:text-amber-600 transition">
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}