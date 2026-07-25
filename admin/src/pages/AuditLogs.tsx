import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAuditLogs } from '../api/client';

const ACTION_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  // User management
  suspend_user: { bg: 'bg-red-100 text-red-700', icon: '⛔', label: 'Suspend User' },
  reactivate_user: { bg: 'bg-green-100 text-green-700', icon: '✅', label: 'Reactivate User' },
  soft_delete_user: { bg: 'bg-red-100 text-red-700', icon: '🗑️', label: 'Delete User' },
  update_user: { bg: 'bg-blue-100 text-blue-700', icon: '✏️', label: 'Update User' },
  reset_verification: { bg: 'bg-amber-100 text-amber-700', icon: '🔄', label: 'Reset Verification' },
  reset_account: { bg: 'bg-red-100 text-red-700', icon: '⚠️', label: 'Reset Account' },
  // Task management
  cancel_task: { bg: 'bg-gray-100 text-gray-700', icon: '❌', label: 'Cancel Task' },
  reassign_task: { bg: 'bg-purple-100 text-purple-700', icon: '🔄', label: 'Reassign Task' },
  // Tasker management
  approved_tasker: { bg: 'bg-green-100 text-green-700', icon: '👍', label: 'Approve Tasker' },
  rejected_tasker: { bg: 'bg-red-100 text-red-700', icon: '👎', label: 'Reject Tasker' },
  suspended_tasker: { bg: 'bg-amber-100 text-amber-700', icon: '⛔', label: 'Suspend Tasker' },
  // Payments
  process_refund: { bg: 'bg-purple-100 text-purple-700', icon: '💸', label: 'Process Refund' },
  approve_payout: { bg: 'bg-green-100 text-green-700', icon: '💰', label: 'Approve Payout' },
  // Notifications
  send_notification: { bg: 'bg-blue-100 text-blue-700', icon: '🔔', label: 'Send Notification' },
  broadcast_notification: { bg: 'bg-indigo-100 text-indigo-700', icon: '📢', label: 'Broadcast' },
  // Disputes
  resolve_dispute: { bg: 'bg-amber-100 text-amber-700', icon: '⚖️', label: 'Resolve Dispute' },
  // Admin management
  create_admin: { bg: 'bg-green-100 text-green-700', icon: '👤', label: 'Create Admin' },
  update_admin_role: { bg: 'bg-blue-100 text-blue-700', icon: '🔐', label: 'Update Role' },
  remove_admin: { bg: 'bg-red-100 text-red-700', icon: '🚫', label: 'Remove Admin' },
  // Security events
  admin_access_denied: { bg: 'bg-red-100 text-red-700', icon: '🚫', label: 'Access Denied' },
  permission_denied: { bg: 'bg-red-100 text-red-700', icon: '🚫', label: 'Permission Denied' },
  auth_failure: { bg: 'bg-red-100 text-red-700', icon: '🔑', label: 'Auth Failure' },
  login_failed: { bg: 'bg-red-100 text-red-700', icon: '🔑', label: 'Login Failed' },
};

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const action = searchParams.get('action') || '';
  const entityType = searchParams.get('entityType') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 30;

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
    setError('');
    try {
      const params: Record<string, any> = { limit, offset: (page - 1) * limit };
      if (action) params.action = action;
      if (entityType) params.entityType = entityType;
      const result = await listAuditLogs(params);
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load audit logs. Check your network connection.');
    }
    finally { setLoading(false); }
  }, [action, entityType, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = action || entityType;

  const getStyle = (actionName: string) => {
    const style = ACTION_STYLES[actionName];
    if (style) return style;
    // Fallback - determine from action prefix
    if (actionName.startsWith('login_')) return { bg: 'bg-purple-100 text-purple-700', icon: '🔑', label: actionName };
    if (actionName.includes('_user') || actionName.includes('_tasker')) return { bg: 'bg-blue-100 text-blue-700', icon: '👤', label: actionName };
    if (actionName.includes('_task')) return { bg: 'bg-gray-100 text-gray-700', icon: '📋', label: actionName };
    if (actionName.includes('_payment') || actionName.includes('refund') || actionName.includes('payout')) return { bg: 'bg-purple-100 text-purple-700', icon: '💳', label: actionName };
    return { bg: 'bg-gray-100 text-gray-700', icon: '📝', label: actionName };
  };

  const isSecurityEvent = (actionName: string) =>
    ['admin_access_denied', 'permission_denied', 'auth_failure', 'login_failed'].includes(actionName);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-gray-500">{total} total events</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={action} onChange={(e) => setParam('action', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Actions</option>
              <optgroup label="User Management">
                <option value="update_user">Update User</option>
                <option value="suspend_user">Suspend User</option>
                <option value="reactivate_user">Reactivate User</option>
                <option value="soft_delete_user">Delete User</option>
                <option value="reset_verification">Reset Verification</option>
                <option value="reset_account">Reset Account</option>
              </optgroup>
              <optgroup label="Task Management">
                <option value="cancel_task">Cancel Task</option>
                <option value="reassign_task">Reassign Task</option>
                <option value="resolve_dispute">Resolve Dispute</option>
              </optgroup>
              <optgroup label="Tasker Management">
                <option value="approved_tasker">Approve Tasker</option>
                <option value="rejected_tasker">Reject Tasker</option>
                <option value="suspended_tasker">Suspend Tasker</option>
              </optgroup>
              <optgroup label="Payments">
                <option value="process_refund">Process Refund</option>
                <option value="approve_payout">Approve Payout</option>
              </optgroup>
              <optgroup label="Notifications">
                <option value="send_notification">Send Notification</option>
                <option value="broadcast_notification">Broadcast</option>
              </optgroup>
              <optgroup label="Admin">
                <option value="create_admin">Create Admin</option>
                <option value="update_admin_role">Update Role</option>
                <option value="remove_admin">Remove Admin</option>
              </optgroup>
              <optgroup label="Security">
                <option value="permission_denied">Permission Denied</option>
                <option value="auth_failure">Auth Failure</option>
                <option value="login_failed">Login Failed</option>
              </optgroup>
            </select>
            <select value={entityType} onChange={(e) => setParam('entityType', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="task">Task</option>
              <option value="tasker">Tasker</option>
              <option value="payment">Payment</option>
              <option value="notification">Notification</option>
              <option value="admin">Admin</option>
              <option value="wallet">Wallet</option>
              <option value="security">Security</option>
            </select>
            {hasFilters && (
              <button onClick={() => setSearchParams({})}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button onClick={load} className="text-sm text-red-500 hover:underline font-medium">Retry</button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <svg className="h-5 w-5 animate-spin mr-2 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading audit logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-gray-400 mb-1">No audit logs found</p>
          <p className="text-sm text-gray-400">Try adjusting your filter criteria</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => {
            const style = getStyle(log.action);
            const isSecurity = isSecurityEvent(log.action);

            return (
              <div
                key={log.id}
                className={`rounded-lg border bg-white p-4 text-sm shadow-sm transition-colors ${
                  isSecurity ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                } hover:border-gray-300`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${style.bg}`}>
                      {style.icon} {style.label}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {log.entityType}
                    </span>
                    {log.entityId && (
                      <span className="font-mono text-xs text-gray-400">
                        #{log.entityId.slice(0, 12)}
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">
                      by{' '}
                      {log.admin?.user?.firstName
                        ? `${log.admin.user.firstName} ${log.admin.user.lastName || ''}`
                        : 'System'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {log.ipAddress && (
                      <span className="text-xs text-gray-400 hidden sm:inline">{log.ipAddress}</span>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {log.changes && Object.keys(log.changes).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-primary-600 hover:text-primary-700">
                      View details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-600 overflow-x-auto border border-gray-100">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </details>
                )}

                {isSecurity && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      🚨 Security Event
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setParam('page', String(page - 1))} disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
