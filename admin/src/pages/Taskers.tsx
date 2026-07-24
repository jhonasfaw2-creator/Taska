import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listTaskers } from '../api/client';
import type { Tasker } from '../types';

const VERIFY_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700', SUSPENDED: 'bg-gray-100 text-gray-700',
};

export default function Taskers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const search = searchParams.get('search') || '';
  const verificationStatus = searchParams.get('verificationStatus') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listTaskers({ search, verificationStatus, limit, offset: (page - 1) * limit });
      setTaskers(result.taskers);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, verificationStatus, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Taskers ({total})</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search..." defaultValue={search}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearchParams(prev => { prev.set('search', (e.target as HTMLInputElement).value); prev.set('page', '1'); return prev; }); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <select value={verificationStatus} onChange={(e) => setSearchParams(prev => { prev.set('verificationStatus', e.target.value); prev.set('page', '1'); return prev; })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">Name</th><th className="px-4 py-3 font-medium text-gray-600">Phone</th><th className="px-4 py-3 font-medium text-gray-600">Status</th><th className="px-4 py-3 font-medium text-gray-600">Rating</th><th className="px-4 py-3 font-medium text-gray-600">Tasks</th><th className="px-4 py-3 font-medium text-gray-600">Earned</th><th className="px-4 py-3 font-medium text-gray-600">Online</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              taskers.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No taskers found</td></tr> :
              taskers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.user?.firstName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.user?.phoneNumber}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VERIFY_COLORS[t.verificationStatus] || ''}`}>{t.verificationStatus}</span></td>
                  <td className="px-4 py-3">{t.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">{t.totalTasksCompleted}</td>
                  <td className="px-4 py-3">{t.wallet ? `ETB ${Number(t.wallet.totalEarned).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">{t.isOnline ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-4 py-3"><Link to={`/taskers/${t.id}`} className="text-primary-600 hover:underline text-xs">View</Link></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
