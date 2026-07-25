import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAdminNotifications, sendAdminNotification, broadcastNotification, sendTargetedNotification } from '../api/client';
import type { User } from '../types';

const NOTIF_COLORS: Record<string, string> = {
  TASK_REQUEST: 'bg-blue-100 text-blue-700', TASK_UPDATE: 'bg-purple-100 text-purple-700',
  PAYMENT: 'bg-green-100 text-green-700', SYSTEM: 'bg-gray-100 text-gray-700',
};

type SendMode = 'broadcast' | 'targeted' | 'single';

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Send notification state
  const [sendMode, setSendMode] = useState<SendMode>('broadcast');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userIds, setUserIds] = useState('');
  const [singleUserId, setSingleUserId] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listAdminNotifications({ limit, offset: (page - 1) * limit });
      setNotifications(result.notifications);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load notifications. Check your network connection.');
    }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const clearSuccess = () => setTimeout(() => setSendSuccess(''), 5000);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return setSendError('Title and message are required');
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      if (sendMode === 'single') {
        if (!singleUserId.trim()) return setSendError('User ID is required');
        await sendTargetedNotification([singleUserId.trim()], title, message);
        setSendSuccess(`Notification sent to user ${singleUserId.trim()}`);
      } else if (sendMode === 'targeted') {
        const ids = userIds.split(',').map((s) => s.trim()).filter(Boolean);
        if (ids.length === 0) return setSendError('Enter at least one user ID');
        await sendTargetedNotification(ids, title, message);
        setSendSuccess(`Notification sent to ${ids.length} user(s)`);
      } else {
        const result = await broadcastNotification(title, message, roleFilter);
        setSendSuccess(`Notification broadcast to ${result.sentCount} user(s) (${roleFilter === 'ALL' ? 'all roles' : roleFilter})`);
      }
      setTitle('');
      setMessage('');
      load();
    } catch (err: any) {
      setSendError(err.response?.data?.error || 'Failed to send');
    } finally { setSending(false); clearSuccess(); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">{total} sent notifications</p>
      </div>

      {/* Send Panel */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Send Notification</h2>

        <div className="mb-4 flex gap-2">
          {(['broadcast', 'single', 'targeted'] as SendMode[]).map((mode) => (
            <button key={mode} onClick={() => setSendMode(mode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                sendMode === mode
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
              {mode === 'broadcast' ? '📢 Broadcast' : mode === 'single' ? '👤 Single User' : '🎯 Targeted'}
            </button>
          ))}
        </div>

        {sendError && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{sendError}</div>}
        {sendSuccess && <div className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-200">{sendSuccess}</div>}

        {sendMode === 'broadcast' && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">Recipient Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="ALL">All Users</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="TASKER">Taskers Only</option>
            </select>
          </div>
        )}

        {sendMode === 'single' && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">User ID</label>
            <input type="text" value={singleUserId} onChange={(e) => setSingleUserId(e.target.value)}
              placeholder="Enter user UUID..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        )}

        {sendMode === 'targeted' && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">User IDs (comma-separated)</label>
            <textarea value={userIds} onChange={(e) => setUserIds(e.target.value)}
              rows={2} placeholder="uuid-1, uuid-2, uuid-3..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <p className="mt-1 text-xs text-gray-400">Enter UUIDs separated by commas (max 1000)</p>
          </div>
        )}

        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title" maxLength={200}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Notification message" rows={3} maxLength={2000}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />

        <div className="flex items-center gap-3">
          <button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {sendMode === 'broadcast' ? 'Broadcast' : sendMode === 'single' ? 'Send to User' : 'Send to Group'}
              </span>
            )}
          </button>
          <span className="text-xs text-gray-400">
            {sendMode === 'broadcast' ? 'Sends to all users with the selected role' :
             sendMode === 'single' ? 'Sends to a specific user by ID' :
             'Sends to multiple users by their IDs'}
          </span>
        </div>
      </div>

      {/* Notification History */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button onClick={load} className="text-sm text-red-500 hover:underline font-medium">Retry</button>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">User</th>
              <th className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 font-medium text-gray-600">Message</th>
              <th className="px-4 py-3 font-medium text-gray-600">Read</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading notifications...
                  </div>
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No notifications sent yet</p>
                  <p className="text-sm">Use the form above to send notifications</p>
                </td>
              </tr>
            ) : notifications.map((n: any) => (
              <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {(n.user?.firstName?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm">{n.user?.firstName || '—'} {n.user?.lastName || ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${NOTIF_COLORS[n.type] || 'bg-gray-100 text-gray-700'}`}>
                    {n.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{n.title}</td>
                <td className="max-w-[250px] truncate px-4 py-3 text-gray-500">{n.message}</td>
                <td className="px-4 py-3">
                  {n.isRead ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Unread
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-400 text-xs">{new Date(n.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })}
            disabled={page <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <span className="self-center text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
