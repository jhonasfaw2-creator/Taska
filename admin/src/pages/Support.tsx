import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listTasks, listUsers, getTaskDetails, resolveDispute } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';

const DISPUTE_ACTIONS = [
  { value: 'none', label: 'Log only (no action)' },
  { value: 'cancel_task', label: 'Cancel Task' },
  { value: 'refund_customer', label: 'Refund Customer & Cancel' },
  { value: 'release_tasker', label: 'Release Tasker' },
] as const;

type SupportTab = 'disputes' | 'reports' | 'overview';

export default function Support() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SupportTab>('overview');

  // Dispute state
  const [disputeTasks, setDisputeTasks] = useState<any[]>([]);
  const [disputeTotal, setDisputeTotal] = useState(0);
  const [disputeLoading, setDisputeLoading] = useState(true);
  const [disputeError, setDisputeError] = useState('');

  // Resolve modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [resolveAction, setResolveAction] = useState('none');
  const [resolveLoading, setResolveLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadDisputes = useCallback(async () => {
    setDisputeLoading(true);
    setDisputeError('');
    try {
      // Find tasks that are in dispute-like statuses (not completed/cancelled, with tasker assigned)
      const result = await listTasks({ status: 'IN_PROGRESS', limit: 50, offset: 0 });
      setDisputeTasks(result.tasks || []);
      setDisputeTotal(result.total || 0);
    } catch (err) {
      setDisputeError('Failed to load disputes. Check your network connection.');
    }
    finally { setDisputeLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'disputes') loadDisputes(); }, [activeTab, loadDisputes]);

  const handleResolve = async () => {
    if (!resolution.trim() || !selectedTask) return;
    setResolveLoading(true);
    try {
      const result = await resolveDispute(selectedTask.id, resolution, resolveAction);
      showMsg('success', `Dispute resolved: ${result.action}`);
      setShowResolveModal(false);
      setSelectedTask(null);
      setResolution('');
      setResolveAction('none');
      loadDisputes();
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to resolve');
    } finally { setResolveLoading(false); }
  };

  const tabs: { key: SupportTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'disputes', label: 'Active Disputes', icon: '⚖️' },
    { key: 'reports', label: 'User Reports', icon: '📋' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage disputes, review reports, and assist users</p>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg p-4 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-xl">⚖️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{disputeTotal}</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('disputes')}
              className="mt-4 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
              View Active Tasks
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quick Actions</p>
                <p className="text-sm font-medium text-gray-700">Resolve disputes, review tasks</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('reports')}
              className="mt-4 w-full rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors">
              View Reports
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Support Tools</p>
                <p className="text-sm font-medium text-gray-700">User reports & dispute resolution</p>
              </div>
            </div>
            <button onClick={() => navigate('/reports')}
              className="mt-4 w-full rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors">
              View Reports Page
            </button>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing tasks currently in progress that may need attention
            </p>
            <button onClick={loadDisputes}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Refresh
            </button>
          </div>

          {disputeError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600 font-medium mb-2">{disputeError}</p>
              <button onClick={loadDisputes} className="text-sm text-red-500 hover:underline font-medium">Retry</button>
            </div>
          ) : disputeLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <svg className="h-5 w-5 animate-spin mr-2 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading tasks...
            </div>
          ) : disputeTasks.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <span className="text-4xl">🎉</span>
              <p className="mt-3 text-lg font-medium text-gray-900">All clear!</p>
              <p className="text-sm text-gray-500">No active tasks require attention right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputeTasks.map((task: any) => (
                <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{task.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                        <span>👤 {task.customer?.firstName || 'Unknown'}</span>
                        {task.tasker && <span>🛵 {task.tasker?.user?.firstName || 'Unknown'}</span>}
                        <span>📁 {task.category?.name}</span>
                        <span>💰 ETB {Number(task.estimatedPrice).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => navigate(`/tasks/${task.id}`)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        View Task
                      </button>
                      <button onClick={() => {
                        setSelectedTask(task);
                        setResolution('');
                        setResolveAction('none');
                        setShowResolveModal(true);
                      }}
                        className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User Reports & Tools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button onClick={() => navigate('/reports')}
              className="rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-all">
              <p className="font-medium text-gray-900 mb-1">📈 View Reports</p>
              <p className="text-sm text-gray-500">Revenue, users, tasks, and payment reports</p>
            </button>
            <button onClick={() => navigate('/users')}
              className="rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-all">
              <p className="font-medium text-gray-900 mb-1">👥 User Management</p>
              <p className="text-sm text-gray-500">Search, filter, and manage platform users</p>
            </button>
            <button onClick={() => navigate('/audit-logs')}
              className="rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-all">
              <p className="font-medium text-gray-900 mb-1">📝 Audit Logs</p>
              <p className="text-sm text-gray-500">Review all admin actions and changes</p>
            </button>
            <button onClick={() => navigate('/notifications')}
              className="rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-all">
              <p className="font-medium text-gray-900 mb-1">🔔 Send Notification</p>
              <p className="text-sm text-gray-500">Broadcast or send targeted notifications</p>
            </button>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowResolveModal(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolve Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">
              Task: <span className="font-medium">{selectedTask?.title}</span>
            </p>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Resolution Notes</label>
              <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
                rows={3} placeholder="Describe the resolution..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Action</label>
              <select value={resolveAction} onChange={(e) => setResolveAction(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500">
                {DISPUTE_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResolveModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleResolve} disabled={!resolution.trim() || resolveLoading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                {resolveLoading ? 'Resolving...' : 'Resolve Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
