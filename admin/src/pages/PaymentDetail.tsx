import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentDetails, processRefund } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('CUSTOMER_REQUEST');
  const [refundDetail, setRefundDetail] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (!id) return;
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    setLoading(true);
    try {
      const data = await getPaymentDetails(id!);
      setPayment(data);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to load payment');
    } finally { setLoading(false); }
  };

  const handleRefund = async () => {
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) return showMsg('error', 'Enter a valid amount');
    if (amount > Number(payment.amount) - Number(payment.refundedAmount)) {
      return showMsg('error', 'Amount exceeds refundable balance');
    }
    setRefundLoading(true);
    try {
      await processRefund(id!, amount, refundReason);
      showMsg('success', `Refund of ETB ${amount.toFixed(2)} processed successfully.`);
      await loadPayment();
      setRefundAmount('');
      setRefundDetail('');
      setShowRefundModal(false);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Refund failed');
    } finally { setRefundLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading payment details...
      </div>
    </div>
  );

  if (!payment) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-600 font-medium">Payment not found</p>
      <button onClick={() => navigate('/payments')} className="mt-2 text-sm text-red-500 hover:underline">Back to Payments</button>
    </div>
  );

  const refundable = Number(payment.amount) - Number(payment.refundedAmount);
  const canRefund = (payment.paymentStatus === 'PAID' || payment.paymentStatus === 'PARTIALLY_REFUNDED') && refundable > 0;

  return (
    <div>
      <button onClick={() => navigate('/payments')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Payments
      </button>

      {message && (
        <div className={`mb-4 rounded-lg p-4 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Payment Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment {payment.transactionReference || payment.id.slice(0, 12)}
              </h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                payment.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                payment.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>{payment.paymentStatus}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{payment.paymentMethod} · {payment.provider}</p>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600">ETB {Number(payment.amount).toFixed(2)}</span>
              <span className="text-sm text-gray-400">Refunded: ETB {Number(payment.refundedAmount).toFixed(2)}</span>
            </div>
          </div>
          {canRefund && (
            <button onClick={() => setShowRefundModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              Process Refund
            </button>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      <ConfirmModal
        open={showRefundModal}
        title="Process Refund"
        message={`Refund ETB ${refundAmount || '0.00'} to the customer for payment ${payment.transactionReference || payment.id.slice(0, 12)}?`}
        confirmLabel="Process Refund"
        confirmColor="purple"
        loading={refundLoading}
        onConfirm={handleRefund}
        onCancel={() => setShowRefundModal(false)}
      />

      {/* Refund Form */}
      {canRefund && (
        <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Process Refund</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-purple-800">Amount (Refundable: ETB {refundable.toFixed(2)})</label>
              <input type="number" value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00" max={refundable}
                className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-purple-800">Reason</label>
              <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="CUSTOMER_REQUEST">Customer Request</option>
                <option value="TASK_CANCELLED">Task Cancelled</option>
                <option value="SERVICE_ISSUE">Service Issue</option>
                <option value="DUPLICATE">Duplicate</option>
                <option value="FRAUD">Fraud</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-purple-800">Reason Detail (optional)</label>
            <textarea value={refundDetail} onChange={(e) => setRefundDetail(e.target.value)}
              rows={2} placeholder="Additional details..."
              className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
          </div>
        </div>
      )}

      {/* Detail Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Customer</span>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {(payment.customer?.firstName?.[0] || '?').toUpperCase()}
                </div>
                <span className="font-medium">{payment.customer?.firstName || 'Unknown'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium font-mono text-xs">{payment.customer?.phoneNumber || '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Task</span>
              <span className="font-medium">{payment.task?.title || '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Task Status</span>
              <span className="font-medium">{payment.task?.status || '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Created</span>
              <span className="font-medium">{new Date(payment.createdAt).toLocaleString()}</span>
            </div>
            {payment.paidAt && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Paid At</span>
                <span className="font-medium">{new Date(payment.paidAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Fee Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
              <span className="text-gray-700">Total Amount</span>
              <span className="font-bold text-green-700">ETB {Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
              <span className="text-gray-700">Platform Fee ({(Number(payment.platformFee) / Number(payment.amount) * 100).toFixed(1)}%)</span>
              <span className="font-medium text-amber-700">-ETB {Number(payment.platformFee).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
              <span className="text-gray-700">Tasker Payout</span>
              <span className="font-bold text-blue-700">ETB {Number(payment.taskerAmount).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-500">Refunded Amount</span>
              <span className={`font-medium ${Number(payment.refundedAmount) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {Number(payment.refundedAmount) > 0 ? `-ETB ${Number(payment.refundedAmount).toFixed(2)}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium">{payment.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Provider</span>
              <span className="font-medium">{payment.provider}</span>
            </div>
            {payment.transactionReference && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs">{payment.transactionReference}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refund History */}
      {payment.refunds?.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Refund History ({payment.refunds.length})</h2>
          <div className="space-y-2">
            {payment.refunds.map((r: any) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-700">-ETB {Number(r.amount).toFixed(2)}</span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">{r.reason}</span>
                </div>
                <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {payment.audits?.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Audit Trail</h2>
          <div className="space-y-2">
            {payment.audits.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-700">
                  {payment.audits.length - payment.audits.indexOf(a)}
                </span>
                <span className="font-medium">{a.event}</span>
                {a.fromStatus && a.toStatus && (
                  <span className="text-gray-400">
                    <span className={a.fromStatus === 'PAID' ? 'text-green-600' : ''}>{a.fromStatus}</span>
                    {' → '}
                    <span className={a.toStatus === 'REFUNDED' ? 'text-purple-600' : ''}>{a.toStatus}</span>
                  </span>
                )}
                <span className="text-gray-400 text-xs ml-auto">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
