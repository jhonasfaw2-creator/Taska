import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listAdminPayments } from '../api/client';
import type { Payment } from '../types';

const PAYMENT_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700', FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700', CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminPayments({ status, limit, offset: (page - 1) * limit });
      setPayments(result.payments);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payments ({total})</h1>
        <select value={status} onChange={(e) => setSearchParams(prev => { prev.set('status', e.target.value); prev.set('page', '1'); return prev; })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">Reference</th><th className="px-4 py-3 font-medium text-gray-600">Customer</th><th className="px-4 py-3 font-medium text-gray-600">Task</th><th className="px-4 py-3 font-medium text-gray-600">Amount</th><th className="px-4 py-3 font-medium text-gray-600">Fee</th><th className="px-4 py-3 font-medium text-gray-600">Status</th><th className="px-4 py-3 font-medium text-gray-600">Method</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              payments.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No payments found</td></tr> :
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.transactionReference || p.id.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.customer?.firstName || 'Unknown'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">{p.task?.title || '—'}</td>
                  <td className="px-4 py-3 font-medium">ETB {Number(p.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">ETB {Number(p.platformFee).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[p.paymentStatus] || ''}`}>{p.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-gray-500">{p.paymentMethod}</td>
                  <td className="px-4 py-3"><Link to={`/payments/${p.id}`} className="text-primary-600 hover:underline text-xs">View</Link></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
