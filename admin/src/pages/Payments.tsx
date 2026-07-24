import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listAdminPayments } from '../api/client';
import type { Payment } from '../types';

const PAYMENT_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700', FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700', PARTIALLY_REFUNDED: 'bg-indigo-100 text-indigo-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const PAYMENT_ICONS: Record<string, string> = {
  PAID: '✅', PENDING: '⏳', PROCESSING: '🔄', FAILED: '❌',
  REFUNDED: '💸', PARTIALLY_REFUNDED: '🔶', CANCELLED: '🚫',
};

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const status = searchParams.get('status') || '';
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
      const params: Record<string, any> = { status, dateFrom, dateTo, limit, offset: (page - 1) * limit };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const result = await listAdminPayments(params);
      setPayments(result.payments);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [status, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = status || dateFrom || dateTo;

  const totalAmount = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalFees = payments.reduce((s, p) => s + Number(p.platformFee), 0);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-500">{total} total transactions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(e) => setParam('status', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="PAID">✅ Paid</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="PROCESSING">🔄 Processing</option>
              <option value="FAILED">❌ Failed</option>
              <option value="REFUNDED">💸 Refunded</option>
              <option value="PARTIALLY_REFUNDED">🔶 Partially Refunded</option>
              <option value="CANCELLED">🚫 Cancelled</option>
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

        {/* Summary Cards */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Volume</p>
              <p className="mt-1 text-lg font-bold text-gray-900">ETB {totalAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Platform Fees</p>
              <p className="mt-1 text-lg font-bold text-amber-600">ETB {totalFees.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg per Transaction</p>
              <p className="mt-1 text-lg font-bold text-blue-600">
                ETB {(payments.length > 0 ? totalAmount / payments.length : 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net After Fees</p>
              <p className="mt-1 text-lg font-bold text-green-600">ETB {(totalAmount - totalFees).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Reference</th>
              <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 font-medium text-gray-600">Task</th>
              <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 font-medium text-gray-600">Fee</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Method</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date</th>
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
                    Loading payments...
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No payments found</p>
                  <p className="text-sm">Try adjusting your filter criteria</p>
                </td>
              </tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-700">
                    {p.transactionReference || p.id.slice(0, 12)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {(p.customer?.firstName?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm">{p.customer?.firstName || 'Unknown'}</span>
                  </div>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-gray-600 text-sm">{p.task?.title || '—'}</td>
                <td className="px-4 py-3 font-medium">ETB {Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">ETB {Number(p.platformFee).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[p.paymentStatus] || ''}`}>
                    {PAYMENT_ICONS[p.paymentStatus] || ''} {p.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.paymentMethod || p.provider}</td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link to={`/payments/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors">
                    View
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
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <div className="flex gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
                else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                  if (page < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  typeof p === 'string' ? <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-gray-400">...</span>
                  : <button key={p} onClick={() => setParam('page', String(p))}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                );
              })()}
            </div>
            <button onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
