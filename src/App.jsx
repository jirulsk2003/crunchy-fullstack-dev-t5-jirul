import { useState, useEffect } from 'react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      localStorage.setItem('token', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProtectedData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unauthorized request');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setToken('');
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    if (token) fetchProtectedData();
  }, [token]);

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#1e293b', color: '#fff', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2>Capstone Login</h2>
        {error && <p style={{ color: '#f87171', background: '#7f1d1d', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} />
          <button type="submit" style={{ padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', color: '#fff', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <h1>Secured Capstone Dashboard</h1>
        <button onClick={() => { setToken(''); localStorage.removeItem('token'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </header>
      <h3>Protected Inventory Items</h3>
      <ul style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', listStyle: 'none' }}>
        {items.map(item => (
          <li key={item.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #334155' }}>
            {item.name} — <span style={{ color: '#38bdf8' }}>Stock: {item.stock}</span> (${item.price})
          </li>
        ))}
      </ul>
    </div>
  );
}