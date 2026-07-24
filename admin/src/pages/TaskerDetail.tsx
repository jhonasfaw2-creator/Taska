import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskerDetails, approveTasker, rejectTasker, suspendTasker } from '../api/client';

import ConfirmModal from '../components/ConfirmModal';

export default function TaskerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tasker, setTasker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (!id) return;
    loadTasker();
  }, [id]);

  const loadTasker = async () => {
    setLoading(true);
    try {
      const data = await getTaskerDetails(id!);
      setTasker(data);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to load tasker');
    } finally { setLoading(false); }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'suspend') => {
    setActionLoading(true);
    try {
      const fn = action === 'approve' ? approveTasker : action === 'reject' ? rejectTasker : suspendTasker;
      await fn(id!);
      await loadTasker();
      showMsg('success', `Tasker ${action}d successfully.`);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || `Failed to ${action} tasker`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const getConfirmProps = () => {
    switch (confirmAction?.type) {
      case 'approve': return { title: 'Approve Tasker', message: 'This will approve the tasker\'s verification and allow them to accept tasks.', confirmLabel: 'Approve', confirmColor: 'green' as const, onConfirm: () => handleAction('approve') };
      case 'reject': return { title: 'Reject Tasker', message: 'This will reject the tasker\'s verification application.', confirmLabel: 'Reject', confirmColor: 'red' as const, onConfirm: () => handleAction('reject') };
      case 'suspend': return { title: 'Suspend Tasker', message: 'This will suspend the tasker and prevent them from accepting tasks.', confirmLabel: 'Suspend', confirmColor: 'amber' as const, onConfirm: () => handleAction('suspend') };
      default: return null;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading tasker details...
      </div>
    </div>
  );

  if (!tasker) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-600 font-medium">Tasker not found</p>
      <button onClick={() => navigate('/taskers')} className="mt-2 text-sm text-red-500 hover:underline">Back to Taskers</button>
    </div>
  );

  const confirmProps = getConfirmProps();

  return (
    <div>
      <button onClick={() => navigate('/taskers')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Taskers
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

      {/* Tasker Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
              tasker.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {(tasker.user?.firstName?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tasker.user?.firstName || 'Unknown'} {tasker.user?.lastName || ''}
              </h1>
              <p className="mt-1 text-gray-500">{tasker.user?.phoneNumber}{tasker.user?.email ? ` · ${tasker.user.email}` : ''}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  tasker.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-300' :
                  tasker.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                  tasker.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-300' :
                  'bg-gray-100 text-gray-700 border-gray-300'
                }`}>
                  {tasker.verificationStatus === 'APPROVED' ? '✅' : tasker.verificationStatus === 'PENDING' ? '⏳' : tasker.verificationStatus === 'REJECTED' ? '❌' : '⛔'}
                  {' '}{tasker.verificationStatus}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  {tasker.rating.toFixed(1)} ★
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {tasker.totalTasksCompleted} tasks completed
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tasker.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tasker.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {tasker.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tasker.verificationStatus !== 'APPROVED' && (
              <button onClick={() => setConfirmAction({ type: 'approve' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
            )}
            {tasker.verificationStatus !== 'REJECTED' && (
              <button onClick={() => setConfirmAction({ type: 'reject' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            )}
            {tasker.verificationStatus !== 'SUSPENDED' && (
              <button onClick={() => setConfirmAction({ type: 'suspend' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Suspend
              </button>
            )}
          </div>
        </div>
        {tasker.bio && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Bio</p>
            <p className="text-sm text-gray-700">{tasker.bio}</p>
          </div>
        )}
        {tasker.experience != null && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{tasker.experience} years</span> of experience
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Wallet & Earnings */}
        {tasker.wallet && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Wallet & Earnings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                <span className="text-sm text-gray-600">Total Earned</span>
                <span className="text-sm font-bold text-green-700">ETB {Number(tasker.wallet.totalEarned).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-sm text-gray-600">Available Balance</span>
                <span className="text-sm font-bold text-blue-700">ETB {Number(tasker.wallet.availableBalance).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span className="text-sm text-gray-600">Pending Balance</span>
                <span className="text-sm font-bold text-amber-700">ETB {Number(tasker.wallet.pendingBalance).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Total Withdrawn</span>
                <span className="text-sm font-medium">ETB {Number(tasker.wallet.totalWithdrawn).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Total Refunded</span>
                <span className="text-sm font-medium text-red-600">ETB {Number(tasker.wallet.totalRefunded).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Balance</span>
                <span className="text-sm font-medium">ETB {Number(tasker.wallet.balance).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Documents */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Verification Documents
          </h2>
          {tasker.verificationDocuments?.length > 0 ? (
            <div className="space-y-3">
              {tasker.verificationDocuments.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{d.documentType}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      d.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{d.status}</span>
                  </div>
                  <a href={d.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Document
                  </a>
                  <p className="mt-1 text-xs text-gray-400">Uploaded {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <svg className="mx-auto h-10 w-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No documents uploaded</p>
            </div>
          )}
        </div>

        {/* Vehicles */}
        {tasker.vehicles && tasker.vehicles.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Vehicles ({tasker.vehicles.length})
            </h2>
            <div className="space-y-2">
              {tasker.vehicles.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium">{v.type}</p>
                    {v.licensePlate && <p className="text-xs text-gray-500">{v.licensePlate}</p>}
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    v.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {v.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {tasker.user?.receivedReviews && tasker.user.receivedReviews.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Recent Reviews ({tasker.user.receivedReviews.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {tasker.user.receivedReviews.map((review: any) => (
                <div key={review.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {review.reviewer?.firstName || 'Anonymous'} {review.reviewer?.lastName || ''}
                    </span>
                    <span className="text-xs font-medium text-yellow-600">
                      {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}
                      {'☆'.repeat(Math.max(0, 5 - Math.min(5, review.rating)))}
                      <span className="text-gray-400 ml-1">({review.rating})</span>
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    Task {review.taskId?.slice(0, 8)} · {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {tasker.tasks && tasker.tasks.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recent Tasks ({tasker.tasks.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-600">Title</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Price</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Category</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasker.tasks.map((task: any) => {
                  const statusColors: Record<string, string> = {
                    COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
                    IN_PROGRESS: 'bg-indigo-100 text-indigo-700', ACCEPTED: 'bg-purple-100 text-purple-700',
                    PENDING: 'bg-gray-100 text-gray-700', SEARCHING: 'bg-blue-100 text-blue-700',
                  };
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium truncate max-w-[200px]">{task.title}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status] || ''}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">ETB {Number(task.estimatedPrice || task.finalPrice || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-500">{task.category?.name || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{new Date(task.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmProps && (
        <ConfirmModal open loading={actionLoading} onCancel={() => setConfirmAction(null)} {...confirmProps} />
      )}
    </div>
  );
}
