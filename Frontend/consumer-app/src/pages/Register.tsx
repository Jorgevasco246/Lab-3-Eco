import { useState } from 'react';
import { API_URL } from '../api/config';

interface Props {
  onSuccess: () => void;
  onLogin: () => void;
}

export default function Register({ onSuccess, onLogin }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer', storeName: '' });
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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Registro</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input className="w-full border p-3 rounded-xl mb-3" placeholder="Nombre"
          value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input className="w-full border p-3 rounded-xl mb-3" placeholder="Email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input className="w-full border p-3 rounded-xl mb-3" placeholder="Contraseña"
          type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <select className="w-full border p-3 rounded-xl mb-3"
          value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
          <option value="consumer">Consumidor</option>
          <option value="store">Tienda</option>
          <option value="delivery">Delivery</option>
        </select>
        {form.role === 'store' && (
          <input className="w-full border p-3 rounded-xl mb-3" placeholder="Nombre de la tienda"
            value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} />
        )}
        <button onClick={handleRegister}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 mb-3">
          Registrarse
        </button>
        <button onClick={onLogin} className="w-full text-gray-500 hover:underline">
          Ya tengo cuenta
        </button>
      </div>
    </div>
  );
}