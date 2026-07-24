import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(phoneNumber, password);
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_user', JSON.stringify(result.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600">Taska Admin</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your platform</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-lg">
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+251911234567" required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
