import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listWallets } from '../api/client';

export default function Wallets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallets, setWallets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listWallets({ limit, offset: (page - 1) * limit });
      setWallets(result.wallets);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wallets ({total})</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">User</th><th className="px-4 py-3 font-medium text-gray-600">Type</th><th className="px-4 py-3 font-medium text-gray-600">Balance</th><th className="px-4 py-3 font-medium text-gray-600">Available</th><th className="px-4 py-3 font-medium text-gray-600">Total Earned</th><th className="px-4 py-3 font-medium text-gray-600">Total Withdrawn</th><th className="px-4 py-3 font-medium text-gray-600">Currency</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              wallets.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No wallets found</td></tr> :
              wallets.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{w.user?.firstName || 'Unknown'} {w.user?.lastName || ''}</td>
                  <td className="px-4 py-3 text-gray-500">{w.walletType}</td>
                  <td className="px-4 py-3 font-medium">{w.currency || 'ETB'} {Number(w.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-600">{w.currency || 'ETB'} {Number(w.availableBalance).toFixed(2)}</td>
                  <td className="px-4 py-3">{w.currency || 'ETB'} {Number(w.totalEarned).toFixed(2)}</td>
                  <td className="px-4 py-3">{w.currency || 'ETB'} {Number(w.totalWithdrawn).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{w.currency || 'ETB'}</td>
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
    </div>
  );
}
