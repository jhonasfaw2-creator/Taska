import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listTasks } from '../api/client';
import type { Task } from '../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700', SEARCHING: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-purple-100 text-purple-700', PICKED_UP: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700', COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listTasks({ search, status, limit, offset: (page - 1) * limit });
      setTasks(result.tasks);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tasks ({total})</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search tasks..." defaultValue={search}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearchParams(prev => { prev.set('search', (e.target as HTMLInputElement).value); prev.set('page', '1'); return prev; }); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
          <select value={status} onChange={(e) => setSearchParams(prev => { prev.set('status', e.target.value); prev.set('page', '1'); return prev; })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SEARCHING">Searching</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">Title</th><th className="px-4 py-3 font-medium text-gray-600">Customer</th><th className="px-4 py-3 font-medium text-gray-600">Tasker</th><th className="px-4 py-3 font-medium text-gray-600">Category</th><th className="px-4 py-3 font-medium text-gray-600">Status</th><th className="px-4 py-3 font-medium text-gray-600">Price</th><th className="px-4 py-3 font-medium text-gray-600">Created</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              tasks.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No tasks found</td></tr> :
              tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{t.customer?.firstName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.tasker?.user?.firstName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.category?.name}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] || ''}`}>{t.status}</span></td>
                  <td className="px-4 py-3">ETB {Number(t.estimatedPrice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link to={`/tasks/${t.id}`} className="text-primary-600 hover:underline text-xs">View</Link></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
