import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listTasks } from '../api/client';
import type { Task } from '../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  SEARCHING: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-purple-100 text-purple-700',
  PICKED_UP: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏳', SEARCHING: '🔍', ACCEPTED: '✅',
  PICKED_UP: '📦', IN_PROGRESS: '🔄', COMPLETED: '🎉', CANCELLED: '❌',
};

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const setParam = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { search, status, categoryId, dateFrom, dateTo, limit, offset: (page - 1) * limit };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const result = await listTasks(params);
      setTasks(result.tasks);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, status, categoryId, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = search || status || categoryId || dateFrom || dateTo;

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">{total} total tasks</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="text" placeholder="Search title or description..." defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value); }}
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <select value={status} onChange={(e) => setParam('status', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="SEARCHING">🔍 Searching</option>
              <option value="ACCEPTED">✅ Accepted</option>
              <option value="PICKED_UP">📦 Picked Up</option>
              <option value="IN_PROGRESS">🔄 In Progress</option>
              <option value="COMPLETED">🎉 Completed</option>
              <option value="CANCELLED">❌ Cancelled</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setParam('dateFrom', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <input type="date" value={dateTo} onChange={(e) => setParam('dateTo', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            {hasFilters && (
              <button onClick={() => setSearchParams({})}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Task</th>
              <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tasker</th>
              <th className="px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="px-4 py-3 font-medium text-gray-600">Vehicle</th>
              <th className="px-4 py-3 font-medium text-gray-600">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading tasks...
                  </div>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No tasks found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 truncate">{t.description}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {(t.customer?.firstName?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm">{t.customer?.firstName || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {t.tasker ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                        {(t.tasker.user?.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="text-sm">{t.tasker.user?.firstName || '—'}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {t.category?.name || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] || ''}`}>
                    {STATUS_ICONS[t.status] || ''} {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  ETB {Number(t.estimatedPrice).toFixed(2)}
                  {t.finalPrice != null && (
                    <span className="ml-1 text-xs text-gray-400">→ {Number(t.finalPrice).toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{(t as any).vehicleType || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link to={`/tasks/${t.id}`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors">
                    Manage
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setParam('page', String(page - 1))} disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <div className="flex gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                  if (page < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">...</span>
                  ) : (
                    <button key={p} onClick={() => setParam('page', String(p))}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                      }`}>{p}</button>
                  )
                );
              })()}
            </div>
            <button onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
