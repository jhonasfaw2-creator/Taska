import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listUsers } from '../api/client';
import type { User } from '../types';

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({ search, role, limit, offset: (page - 1) * limit });
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Users ({total})</h1>
        <div className="flex gap-2">
          <input
            type="text" placeholder="Search users..." defaultValue={search}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearchParams(prev => { prev.set('search', (e.target as HTMLInputElement).value); prev.set('page', '1'); return prev; }); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          <select value={role} onChange={(e) => setSearchParams(prev => { prev.set('role', e.target.value); prev.set('page', '1'); return prev; })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="TASKER">Tasker</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">Name</th><th className="px-4 py-3 font-medium text-gray-600">Phone</th><th className="px-4 py-3 font-medium text-gray-600">Role</th><th className="px-4 py-3 font-medium text-gray-600">Verified</th><th className="px-4 py-3 font-medium text-gray-600">Tasks</th><th className="px-4 py-3 font-medium text-gray-600">Status</th><th className="px-4 py-3 font-medium text-gray-600">Created</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              users.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No users found</td></tr> :
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phoneNumber}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">{u.role}</span></td>
                  <td className="px-4 py-3">{u.isVerified ? <span className="text-green-600">Yes</span> : <span className="text-red-500">No</span>}</td>
                  <td className="px-4 py-3">{u._count?.tasks ?? 0}</td>
                  <td className="px-4 py-3">{u.deletedAt ? <span className="text-red-500">Suspended</span> : <span className="text-green-600">Active</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link to={`/users/${u.id}`} className="text-primary-600 hover:underline text-xs">View</Link></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setSearchParams(prev => { prev.set('page', String(p)); return prev; })}
              className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
