import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentDetails, processRefund } from '../api/client';

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('CUSTOMER_REQUEST');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    getPaymentDetails(id).then(setPayment).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleRefund = async () => {
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) return alert('Enter a valid amount');
    if (amount > Number(payment.amount) - Number(payment.refundedAmount)) return alert('Amount exceeds refundable balance');
    if (!confirm(`Process refund of ETB ${amount.toFixed(2)}?`)) return;
    try {
      await processRefund(id!, amount, refundReason);
      setMessage('Refund processed successfully');
      const updated = await getPaymentDetails(id!);
      setPayment(updated);
      setRefundAmount('');
    } catch (err: any) { setMessage(err.response?.data?.error || 'Refund failed'); }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!payment) return <p className="text-red-500">Payment not found</p>;

  const refundable = Number(payment.amount) - Number(payment.refundedAmount);

  return (
    <div>
      <button onClick={() => navigate('/payments')} className="mb-4 text-sm text-primary-600 hover:underline">&larr; Back to Payments</button>
      {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment {payment.transactionReference || payment.id.slice(0, 12)}</h1>
            <p className="mt-1 text-gray-500">{payment.paymentMethod} · {payment.provider}</p>
            <div className="mt-2 flex gap-4">
              <span className="text-3xl font-bold text-primary-600">ETB {Number(payment.amount).toFixed(2)}</span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{payment.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{payment.customer?.firstName || 'Unknown'} ({payment.customer?.phoneNumber})</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Task</span><span>{payment.task?.title || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span>ETB {Number(payment.platformFee).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tasker Payout</span><span className="text-green-600">ETB {Number(payment.taskerAmount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Refunded</span><span>{Number(payment.refundedAmount) > 0 ? `ETB ${Number(payment.refundedAmount).toFixed(2)}` : 'None'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{new Date(payment.createdAt).toLocaleString()}</span></div>
          </div>
        </div>

        {(payment.paymentStatus === 'PAID' || payment.paymentStatus === 'PARTIALLY_REFUNDED') && refundable > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Process Refund</h2>
            <p className="mb-3 text-sm text-gray-500">Refundable: ETB {refundable.toFixed(2)}</p>
            <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Amount" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="CUSTOMER_REQUEST">Customer Request</option>
              <option value="TASK_CANCELLED">Task Cancelled</option>
              <option value="SERVICE_ISSUE">Service Issue</option>
              <option value="DUPLICATE">Duplicate</option>
              <option value="FRAUD">Fraud</option>
              <option value="OTHER">Other</option>
            </select>
            <button onClick={handleRefund} className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Process Refund</button>
          </div>
        )}
      </div>

      {payment.refunds?.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Refund History</h2>
          <div className="space-y-2">
            {payment.refunds.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-medium text-purple-700">-ETB {Number(r.amount).toFixed(2)}</span>
                <span className="text-gray-500">{r.reason}</span>
                <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {payment.audits?.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Audit Trail</h2>
          <div className="space-y-2">
            {payment.audits.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                <span className="font-medium">{a.event}</span>
                {a.fromStatus && <span className="text-gray-400">{a.fromStatus} → {a.toStatus}</span>}
                <span className="text-gray-400 text-xs">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
