import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAdminUsers, createAdminUser, updateAdminUserRole, deleteAdminUser } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import type { AdminUser } from '../types';

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700', ADMIN: 'bg-blue-100 text-blue-700',
  MODERATOR: 'bg-green-100 text-green-700', SUPPORT: 'bg-amber-100 text-amber-700',
};

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ userId: '', role: 'MODERATOR' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: string; role: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listAdminUsers({ limit, offset: (page - 1) * limit });
      setAdminUsers(Array.isArray(result) ? result : result.adminUsers);
      setTotal(result.total ?? (Array.isArray(result) ? result.length : 0));
    } catch (err) {
      setError('Failed to load admin users. Check your network connection.');
    }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.userId.trim()) { setMessage('User ID is required'); return; }
    try {
      await createAdminUser({ userId: form.userId, role: form.role as AdminUser['role'] });
      setMessage('Admin user created');
      setShowCreate(false);
      setForm({ userId: '', role: 'MODERATOR' });
      load();
    } catch (err: any) { setMessage(err.response?.data?.error || 'Failed to create'); }
  };

  const handleConfirmRole = async () => {
    if (!confirmRole) return;
    setActionLoading(true);
    try {
      await updateAdminUserRole(confirmRole.id, confirmRole.role);
      setMessage('Role updated');
      setConfirmRole(null);
      load();
    } catch (err: any) { setMessage(err.response?.data?.error || 'Failed to update'); }
    finally { setActionLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await deleteAdminUser(confirmDelete);
      setMessage('Admin user deleted');
      setConfirmDelete(null);
      load();
    } catch (err: any) { setMessage(err.response?.data?.error || 'Failed to delete'); }
    finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Users ({total})</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          {showCreate ? 'Cancel' : 'Add Admin'}
        </button>
      </div>

      {message && <div className={`mb-4 rounded-lg p-3 text-sm flex items-center justify-between ${message.includes('Failed') || message === 'User ID is required' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}><span>{message}</span><button onClick={() => setMessage('')} className="text-current opacity-60 hover:opacity-100">&times;</button></div>}

      {showCreate && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Create Admin User</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">User ID</label>
              <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="Enter user ID" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>
            <button onClick={handleCreate} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Create</button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button onClick={load} className="text-sm text-red-500 hover:underline font-medium">Retry</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">User</th><th className="px-4 py-3 font-medium text-gray-600">Phone</th><th className="px-4 py-3 font-medium text-gray-600">Role</th><th className="px-4 py-3 font-medium text-gray-600">Last Login</th><th className="px-4 py-3 font-medium text-gray-600">Permissions</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              adminUsers.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No admin users found</td></tr> :
              adminUsers.map((au) => (
                <tr key={au.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{au.user?.firstName || 'Unknown'} {au.user?.lastName || ''}</td>
                  <td className="px-4 py-3 text-gray-500">{au.user?.phoneNumber}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[au.role] || ''}`}>{au.role}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{au.lastLoginAt ? new Date(au.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-500">{Array.isArray(au.permissions) ? au.permissions.join(', ') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <select value={au.role} onChange={(e) => setConfirmRole({ id: au.id, role: e.target.value })} className="rounded border px-1.5 py-1 text-xs">
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="SUPPORT">Support</option>
                      </select>
                      <button onClick={() => setConfirmDelete(au.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <button onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Previous</button>}
          <span className="self-center text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
          {page < Math.ceil(total / limit) && <button onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Next</button>}
        </div>
      )}

      <ConfirmModal open={confirmDelete !== null} title="Delete Admin User"
        message="Delete this admin user? This cannot be undone."
        confirmLabel="Delete" confirmColor="red" loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)} />

      <ConfirmModal open={confirmRole !== null} title="Change Role"
        message={`Change this admin's role to ${confirmRole?.role}?`}
        confirmLabel="Change Role" confirmColor="blue" loading={actionLoading}
        onConfirm={handleConfirmRole}
        onCancel={() => setConfirmRole(null)} />
    </div>
  );
}
