import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listWallets, approvePayout, getWalletTransactions } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

export default function Wallets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallets, setWallets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Transaction modal state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txWallet, setTxWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txLoading, setTxLoading] = useState(false);

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

  const totalPages = Math.ceil(total / limit);

  const openTransactions = async (w: any) => {
    setTxWallet(w);
    setShowTxModal(true);
    setTxLoading(true);
    try {
      const result = await getWalletTransactions(w.id, { limit: 50, offset: 0 });
      setTransactions(result.transactions);
      setTxTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setTxLoading(false); }
  };

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) return;
    if (amount > Number(selectedWallet.availableBalance)) {
      return;
    }
    setPayoutLoading(true);
    try {
      await approvePayout(selectedWallet.id, amount);
      await load();
      setShowPayoutModal(false);
      setPayoutAmount('');
      setSelectedWallet(null);
    } catch (err: any) { console.error(err); }
    finally { setPayoutLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasker Wallets</h1>
        <p className="mt-1 text-sm text-gray-500">{total} wallets</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Tasker</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Balance</th>
              <th className="px-4 py-3 font-medium text-gray-600">Available</th>
              <th className="px-4 py-3 font-medium text-gray-600">Pending</th>
              <th className="px-4 py-3 font-medium text-gray-600">Earned</th>
              <th className="px-4 py-3 font-medium text-gray-600">Withdrawn</th>
              <th className="px-4 py-3 font-medium text-gray-600">Txns</th>
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
                    Loading wallets...
                  </div>
                </td>
              </tr>
            ) : wallets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No wallets found</p>
                  <p className="text-sm">Taskers with earnings will appear here</p>
                </td>
              </tr>
            ) : wallets.map((w: any) => {
              const available = Number(w.availableBalance);
              return (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {(w.tasker?.user?.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="font-medium">{w.tasker?.user?.firstName || 'Unknown'} {w.tasker?.user?.lastName || ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{w.tasker?.user?.phoneNumber || '—'}</td>
                  <td className="px-4 py-3 font-medium">{Number(w.balance).toFixed(2)} ETB</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{available.toFixed(2)} ETB</td>
                  <td className="px-4 py-3 text-amber-600">{Number(w.pendingBalance).toFixed(2)} ETB</td>
                  <td className="px-4 py-3 font-medium">{Number(w.totalEarned).toFixed(2)} ETB</td>
                  <td className="px-4 py-3">{Number(w.totalWithdrawn).toFixed(2)} ETB</td>
                  <td className="px-4 py-3 text-gray-500">{w._count?.transactions ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openTransactions(w)}
                        className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                        Txns
                      </button>
                      {available > 0 && (
                        <button onClick={() => { setSelectedWallet(w); setPayoutAmount(''); setShowPayoutModal(true); }}
                          className="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                          Pay out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      <ConfirmModal
        open={showPayoutModal}
        title="Approve Payout"
        message={`Process payout of ETB ${payoutAmount || '0.00'} to ${selectedWallet?.tasker?.user?.firstName || 'this tasker'}?`}
        confirmLabel="Approve Payout"
        confirmColor="green"
        loading={payoutLoading}
        onConfirm={handlePayout}
        onCancel={() => { setShowPayoutModal(false); setSelectedWallet(null); }}
      />

      {/* Payout Form */}
      {showPayoutModal && selectedWallet && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative z-50 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Payout</h3>
            <p className="text-sm text-gray-500 mb-2">
              Available balance: <span className="font-medium text-green-600">{Number(selectedWallet.availableBalance).toFixed(2)} ETB</span>
            </p>
            <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Amount" max={Number(selectedWallet.availableBalance)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowPayoutModal(false); setSelectedWallet(null); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handlePayout} disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || payoutLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {payoutLoading ? 'Processing...' : 'Approve Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTxModal(false)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transactions · {txWallet?.tasker?.user?.firstName || 'User'}
              </h2>
              <button onClick={() => setShowTxModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            {txLoading ? (
              <p className="text-center text-gray-400 py-8">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === 'TASK_EARNING' ? 'bg-green-100 text-green-700' :
                        tx.type === 'WITHDRAWAL' || tx.type === 'PAYOUT' ? 'bg-red-100 text-red-700' :
                        tx.type === 'REFUND' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{tx.type}</span>
                      <span className="text-sm text-gray-600">{tx.description || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(tx.amount) >= 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} ETB
                      </span>
                      <span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowTxModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
