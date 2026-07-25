import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listTaskers } from '../api/client';
import type { Tasker } from '../types';

const VERIFY_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
  APPROVED: 'bg-green-100 text-green-700 border-green-300',
  REJECTED: 'bg-red-100 text-red-700 border-red-300',
  SUSPENDED: 'bg-gray-100 text-gray-700 border-gray-300',
};

const VERIFY_ICONS: Record<string, string> = {
  PENDING: '⏳', APPROVED: '✅', REJECTED: '❌', SUSPENDED: '⛔',
};

export default function Taskers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = searchParams.get('search') || '';
  const verificationStatus = searchParams.get('verificationStatus') || '';
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
    setError('');
    try {
      const params: Record<string, any> = { search, verificationStatus, limit, offset: (page - 1) * limit };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const result = await listTaskers(params);
      setTaskers(result.taskers);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load taskers. Check your network connection.');
    }
    finally { setLoading(false); }
  }, [search, verificationStatus, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = search || verificationStatus;

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Taskers</h1>
            <p className="mt-1 text-sm text-gray-500">{total} total taskers</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="text" placeholder="Search by name or phone..." defaultValue={search}
              onKeyDown={(e) => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value); }}
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <select value={verificationStatus} onChange={(e) => setParam('verificationStatus', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="REJECTED">❌ Rejected</option>
              <option value="SUSPENDED">⛔ Suspended</option>
            </select>
            {hasFilters && (
              <button onClick={() => setSearchParams({})}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button onClick={load} className="text-sm text-red-500 hover:underline font-medium">Retry</button>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Tasker</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Rating</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tasks</th>
              <th className="px-4 py-3 font-medium text-gray-600">Earnings</th>
              <th className="px-4 py-3 font-medium text-gray-600">Online</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading taskers...
                  </div>
                </td>
              </tr>
            ) : taskers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No taskers found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : taskers.map((t) => {
              const earned = t.wallet?.totalEarned ? Number(t.wallet.totalEarned) : 0;
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        t.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(t.user?.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {t.user?.firstName || 'Unknown'} {t.user?.lastName || ''}
                        </p>
                        {t.user?.email && <p className="text-xs text-gray-400">{t.user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{t.user?.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${VERIFY_COLORS[t.verificationStatus] || ''}`}>
                      {VERIFY_ICONS[t.verificationStatus] || ''} {t.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      {t.rating.toFixed(1)}
                      <span className="text-yellow-500">★</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{t.totalTasksCompleted}</span>
                  </td>
                  <td className="px-4 py-3">
                    {earned > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-green-600">ETB {earned.toFixed(2)}</p>
                        {t.wallet?.availableBalance != null && (
                          <p className="text-xs text-gray-400">{Number(t.wallet.availableBalance).toFixed(2)} available</p>
                        )}
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${t.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-medium ${t.isOnline ? 'text-green-700' : 'text-gray-400'}`}>
                        {t.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/taskers/${t.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors">
                      Manage
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

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
