import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskDetails, cancelTask, reassignTask, listTaskers, resolveDispute as resolveDisputeApi } from '../api/client';

import ConfirmModal from '../components/ConfirmModal';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700', SEARCHING: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-purple-100 text-purple-700', PICKED_UP: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700', COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const DISPUTE_ACTIONS = [
  { value: 'none', label: 'No action (log only)' },
  { value: 'cancel_task', label: 'Cancel Task' },
  { value: 'refund_customer', label: 'Refund Customer & Cancel' },
  { value: 'release_tasker', label: 'Release Tasker (re-open)' },
] as const;

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancel state
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reassign state
  const [showReassign, setShowReassign] = useState(false);
  const [taskerSearch, setTaskerSearch] = useState('');
  const [availableTaskers, setAvailableTaskers] = useState<any[]>([]);
  const [reassignLoading, setReassignLoading] = useState(false);

  // Dispute state
  const [showDispute, setShowDispute] = useState(false);
  const [disputeResolution, setDisputeResolution] = useState('');
  const [disputeAction, setDisputeAction] = useState('none');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (!id) return;
    loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const data = await getTaskDetails(id!);
      setTask(data);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to load task');
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      await cancelTask(id!, cancelReason);
      setTask((prev: any) => ({ ...prev, status: 'CANCELLED' }));
      showMsg('success', 'Task cancelled successfully.');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to cancel task');
    } finally { setCancelLoading(false); }
  };

  const searchTaskers = useCallback(async (q: string) => {
    if (!q.trim()) { setAvailableTaskers([]); return; }
    setReassignLoading(true);
    try {
      const result = await listTaskers({ search: q, verificationStatus: 'APPROVED', limit: 10, offset: 0 });
      setAvailableTaskers(result.taskers || []);
    } catch (err) { console.error(err); }
    finally { setReassignLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchTaskers(taskerSearch), 300);
    return () => clearTimeout(timer);
  }, [taskerSearch, searchTaskers]);

  const handleReassign = async (taskerId: string) => {
    setReassignLoading(true);
    try {
      await reassignTask(id!, taskerId);
      await loadTask();
      showMsg('success', 'Task reassigned successfully.');
      setShowReassign(false);
      setTaskerSearch('');
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to reassign');
    } finally { setReassignLoading(false); }
  };

  const handleResolveDispute = async () => {
    if (!disputeResolution.trim()) return;
    setDisputeLoading(true);
    try {
      const result = await resolveDisputeApi(id!, disputeResolution, disputeAction);
      await loadTask();
      showMsg('success', `Dispute resolved: ${result.action} — ${result.resolution}`);
      setShowDispute(false);
      setDisputeResolution('');
      setDisputeAction('none');
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to resolve dispute');
    } finally { setDisputeLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading task details...
      </div>
    </div>
  );

  if (!task) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-600 font-medium">Task not found</p>
      <button onClick={() => navigate('/tasks')} className="mt-2 text-sm text-red-500 hover:underline">Back to Tasks</button>
    </div>
  );

  const isTerminal = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const canCancel = !isTerminal;
  const canReassign = task.status === 'ACCEPTED' || task.status === 'IN_PROGRESS' || task.status === 'PICKED_UP';
  const canDispute = !isTerminal;

  return (
    <div>
      <button onClick={() => navigate('/tasks')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tasks
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

      {/* Task Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{task.title}</h1>
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[task.status] || ''}`}>
                {task.status}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{task.description}</p>
            {task.specialInstructions && (
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-medium text-amber-800 mb-1">Special Instructions</p>
                <p className="text-sm text-amber-700">{task.specialInstructions}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {task.category?.name}
              </span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                ETB {Number(task.estimatedPrice).toFixed(2)}
              </span>
              {task.finalPrice != null && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Final: ETB {Number(task.finalPrice).toFixed(2)}
                </span>
              )}
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {(task as any).vehicleType}
              </span>
              {task.payment && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  task.payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                  task.payment.paymentStatus === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {task.payment.paymentStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          {canCancel && (
            <button onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Task
            </button>
          )}
          {canReassign && task.taskerId && (
            <button onClick={() => setShowReassign(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Reassign Tasker
            </button>
          )}
          {canDispute && (
            <button onClick={() => setShowDispute(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resolve Dispute
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        open={showCancelModal}
        title="Cancel Task"
        message="This will cancel the task and notify all parties. This action cannot be undone."
        confirmLabel="Cancel Task"
        confirmColor="red"
        loading={cancelLoading}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Reassign Panel */}
      {showReassign && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Reassign Tasker</h2>
            <button onClick={() => { setShowReassign(false); setTaskerSearch(''); }}
              className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <input type="text" placeholder="Search for approved taskers by name or phone..."
            value={taskerSearch} onChange={(e) => setTaskerSearch(e.target.value)}
            className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3" />
          {reassignLoading && <p className="text-sm text-blue-600 mb-2">Searching...</p>}
          {availableTaskers.length > 0 && (
            <div className="grid gap-2">
              {availableTaskers.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-white border border-blue-200 p-3">
                  <div>
                    <p className="text-sm font-medium">{t.user?.firstName} {t.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{t.user?.phoneNumber} · {t.totalTasksCompleted} tasks · ⭐ {t.rating.toFixed(1)}</p>
                  </div>
                  <button onClick={() => handleReassign(t.id)} disabled={reassignLoading}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {reassignLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {taskerSearch && !reassignLoading && availableTaskers.length === 0 && (
            <p className="text-sm text-gray-500">No approved taskers found matching "{taskerSearch}"</p>
          )}
        </div>
      )}

      {/* Dispute Resolution Panel */}
      {showDispute && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-amber-900">Resolve Dispute</h2>
            <button onClick={() => { setShowDispute(false); setDisputeResolution(''); }}
              className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-amber-800">Resolution Notes</label>
            <textarea value={disputeResolution} onChange={(e) => setDisputeResolution(e.target.value)}
              rows={3} placeholder="Describe the dispute resolution..."
              className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-amber-800">Action</label>
            <select value={disputeAction} onChange={(e) => setDisputeAction(e.target.value)}
              className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500">
              {DISPUTE_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleResolveDispute} disabled={!disputeResolution.trim() || disputeLoading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors">
            {disputeLoading ? 'Resolving...' : 'Resolve Dispute'}
          </button>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Location */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </h2>
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">PICKUP</p>
              <p className="text-sm text-gray-900">{task.pickupAddress}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">DROPOFF</p>
              <p className="text-sm text-gray-900">{task.dropoffAddress}</p>
            </div>
          </div>
        </div>

        {/* People */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            People
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-700">
                {task.customer?.firstName?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{task.customer?.firstName} {task.customer?.lastName}</p>
                <p className="text-xs text-gray-500">{task.customer?.phoneNumber}{task.customer?.email ? ` · ${task.customer.email}` : ''}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 rounded-lg p-3 ${task.tasker ? 'bg-purple-50' : 'bg-gray-50'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${task.tasker ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                {task.tasker?.user?.firstName?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {task.tasker?.user?.firstName ? `${task.tasker.user.firstName} ${task.tasker.user.lastName || ''}` : 'Not assigned'}
                </p>
                {task.tasker?.user?.phoneNumber && (
                  <p className="text-xs text-gray-500">{task.tasker.user.phoneNumber}</p>
                )}
              </div>
              {task.tasker && (
                <span className="ml-auto text-xs text-purple-600 font-medium">
                  ⭐ {task.tasker.rating?.toFixed(1) || 'N/A'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {task.payment && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">ETB {Number(task.payment.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Platform Fee</span>
                <span className="font-medium">-ETB {Number(task.payment.platformFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Tasker Payout</span>
                <span className="font-medium text-green-600">ETB {Number(task.payment.taskerAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{task.payment.paymentMethod}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Provider</span>
                <span className="font-medium">{task.payment.provider}</span>
              </div>
              {task.payment.transactionReference && (
                <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs">{task.payment.transactionReference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {task.images && task.images.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Images ({task.images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {task.images.map((img: any) => (
                <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={img.imageUrl} alt="Task" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status History & Offers — bottom section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Timeline */}
        {task.statusHistory && task.statusHistory.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status History
            </h2>
            <div className="relative">
              {task.statusHistory.map((h: any, idx: number) => (
                <div key={h.id} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < task.statusHistory.length - 1 && <div className="mt-1 h-full w-0.5 bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[h.status] || ''}`}>
                        {h.status}
                      </span>
                      <span className="text-xs text-gray-400">by {h.changedBy}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offers */}
        {task.offers && task.offers.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Offers ({task.offers.length})
            </h2>
            <div className="space-y-2">
              {task.offers.map((offer: any) => (
                <div key={offer.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{offer.tasker?.user?.firstName || 'Unknown'}</span>
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{offer.status}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">ETB {Number(offer.price).toFixed(2)}</span>
                  </div>
                  {offer.message && <p className="mt-1 text-xs text-gray-500">{offer.message}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations Preview */}
        {task.conversations && task.conversations.length > 0 && (
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Conversation
            </h2>
            {task.conversations.map((conv: any) => (
              <div key={conv.id} className="space-y-2 max-h-64 overflow-y-auto">
                {conv.messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.senderId === task.customerId ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.senderId === task.customerId ? 'bg-gray-100 text-gray-900' : 'bg-primary-100 text-primary-900'
                    }`}>
                      <p>{msg.content}</p>
                      <p className="mt-0.5 text-xs opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
