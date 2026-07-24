import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, updateUser, suspendUser, reactivateUser, deleteUser } from '../api/client';
import type { User } from '../types';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    getUserDetails(id).then((data) => {
      setUser(data);
      setForm({ firstName: data.firstName || '', lastName: data.lastName || '', email: data.email || '' });
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    try { const updated = await updateUser(id!, form); setUser(updated); setEditing(false); setMessage('User updated.'); }
    catch (err: any) { setMessage(err.response?.data?.error || 'Update failed'); }
  };

  const handleSuspend = async () => {
    if (!confirm('Suspend this user?')) return;
    try { await suspendUser(id!); setUser((prev: any) => ({ ...prev, deletedAt: new Date().toISOString() })); setMessage('User suspended.'); }
    catch (err: any) { setMessage(err.response?.data?.error || 'Failed'); }
  };

  const handleReactivate = async () => {
    try { await reactivateUser(id!); setUser((prev: any) => ({ ...prev, deletedAt: null })); setMessage('User reactivated.'); }
    catch (err: any) { setMessage(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this user?')) return;
    try { await deleteUser(id!); navigate('/users'); }
    catch (err: any) { setMessage(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!user) return <p className="text-red-500">User not found</p>;

  const isTasker = user.role === 'TASKER' && user.taskerProfile;
  const isSuspended = !!user.deletedAt;

  return (
    <div>
      <button onClick={() => navigate('/users')} className="mb-4 text-sm text-primary-600 hover:underline">&larr; Back to Users</button>
      {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unnamed User'}</h1>
            <p className="mt-1 text-gray-500">{user.phoneNumber}{user.email ? ` · ${user.email}` : ''}</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">{user.role}</span>
              {user.isVerified ? <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Verified</span> : <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Unverified</span>}
              {isSuspended ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Suspended</span> : <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {isSuspended ? (
              <button onClick={handleReactivate} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Reactivate</button>
            ) : (
              <button onClick={handleSuspend} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Suspend</button>
            )}
            <button onClick={() => setEditing(!editing)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Edit</button>
            <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit User</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">First Name</label><input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label><input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
          </div>
          <button onClick={handleUpdate} className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save Changes</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {isTasker && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Tasker Profile</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-medium ${user.taskerProfile.verificationStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>{user.taskerProfile.verificationStatus}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="font-medium">{user.taskerProfile.rating.toFixed(1)} ⭐</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Completed Tasks</span><span className="font-medium">{user.taskerProfile.totalTasksCompleted}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Online</span><span className={`font-medium ${user.taskerProfile.isOnline ? 'text-green-600' : 'text-gray-500'}`}>{user.taskerProfile.isOnline ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Onboarded</span><span className="font-medium">{user.isOnboarded ? 'Yes' : 'No'}</span></div>
            {user._count && <div className="flex justify-between"><span className="text-gray-500">Total Tasks</span><span className="font-medium">{user._count.tasks}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
