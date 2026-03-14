import { useState } from 'react';
import { API_URL } from '../api/config';

interface Props {
  onSuccess: () => void;
  onLogin: () => void;
}

export default function Register({ onSuccess, onLogin }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'store', storeName: '' });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏪</div>
          <h2 className="text-3xl font-bold text-gray-800">Crear tienda</h2>
          <p className="text-gray-400 mt-2 text-sm">Registra tu negocio</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tu nombre</label>
            <input className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              placeholder="Nombre completo"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              placeholder="correo@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Contraseña</label>
            <input className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              placeholder="••••••••" type="password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nombre de la tienda</label>
            <input className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              placeholder="Nombre de tu tienda"
              value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} />
          </div>

          <button onClick={handleRegister}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 active:scale-95 transition mt-2 shadow-lg shadow-green-200">
            Crear tienda
          </button>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onLogin}
              className="text-green-600 font-semibold hover:text-green-700 hover:underline transition">
              Inicia sesión
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}