import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskerDetails, approveTasker, rejectTasker, suspendTasker } from '../api/client';

export default function TaskerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tasker, setTasker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    getTaskerDetails(id).then(setTasker).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject' | 'suspend') => {
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this tasker?`)) return;
    try {
      const fn = action === 'approve' ? approveTasker : action === 'reject' ? rejectTasker : suspendTasker;
      await fn(id!);
      const updated = await getTaskerDetails(id!);
      setTasker(updated);
      setMessage(`Tasker ${action}d successfully.`);
    } catch (err: any) { setMessage(err.response?.data?.error || 'Action failed'); }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!tasker) return <p className="text-red-500">Tasker not found</p>;

  return (
    <div>
      <button onClick={() => navigate('/taskers')} className="mb-4 text-sm text-primary-600 hover:underline">&larr; Back to Taskers</button>
      {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tasker.user?.firstName || 'Unknown'} {tasker.user?.lastName || ''}</h1>
            <p className="mt-1 text-gray-500">{tasker.user?.phoneNumber} · {tasker.user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tasker.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : tasker.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{tasker.verificationStatus}</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{tasker.rating.toFixed(1)} ⭐</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">{tasker.totalTasksCompleted} tasks</span>
            </div>
          </div>
          <div className="flex gap-2">
            {tasker.verificationStatus !== 'APPROVED' && <button onClick={() => handleAction('approve')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Approve</button>}
            {tasker.verificationStatus !== 'REJECTED' && <button onClick={() => handleAction('reject')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Reject</button>}
            {tasker.verificationStatus !== 'SUSPENDED' && <button onClick={() => handleAction('suspend')} className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">Suspend</button>}
          </div>
        </div>
        {tasker.bio && <p className="mt-4 text-sm text-gray-600">{tasker.bio}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tasker.wallet && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Wallet</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="font-medium">ETB {Number(tasker.wallet.balance).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Available</span><span className="font-medium text-green-600">ETB {Number(tasker.wallet.availableBalance).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Earned</span><span className="font-medium">ETB {Number(tasker.wallet.totalEarned).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Withdrawn</span><span className="font-medium">ETB {Number(tasker.wallet.totalWithdrawn).toFixed(2)}</span></div>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Verification Documents</h2>
          {tasker.verificationDocuments?.length > 0 ? (
            <div className="space-y-2">
              {tasker.verificationDocuments.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span>{d.documentType}</span>
                  <span className={`text-xs ${d.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>{d.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No documents uploaded</p>}
        </div>
      </div>
    </div>
  );
}
