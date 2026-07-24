import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAdminNotifications } from '../api/client';

const NOTIF_COLORS: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700', TASK_ASSIGNED: 'bg-purple-100 text-purple-700',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-700', PAYMENT_FAILED: 'bg-red-100 text-red-700',
  WALLET_CREDITED: 'bg-teal-100 text-teal-700', TASKER_APPLICATION: 'bg-amber-100 text-amber-700',
  ACCOUNT_SUSPENDED: 'bg-red-100 text-red-700', SYSTEM: 'bg-gray-100 text-gray-700',
};

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminNotifications({ limit, offset: (page - 1) * limit });
      setNotifications(result.notifications);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return alert('Subject and message are required');
    try {
      const { sendAdminNotification } = await import('../api/client');
      await sendAdminNotification({ subject, message, topic: 'ALL_USERS' });
      setSendSuccess('Notification sent to all users');
      setSubject('');
      setMessage('');
      load();
    } catch (err: any) { setSendError(err.response?.data?.error || 'Failed to send'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications ({total})</h1>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Send Notification</h2>
        {sendError && <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{sendError}</div>}
        {sendSuccess && <div className="mb-3 rounded-lg bg-green-50 p-2 text-sm text-green-600">{sendSuccess}</div>}
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3} className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button onClick={handleSend} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Send to All Users</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-600">User</th><th className="px-4 py-3 font-medium text-gray-600">Type</th><th className="px-4 py-3 font-medium text-gray-600">Title</th><th className="px-4 py-3 font-medium text-gray-600">Message</th><th className="px-4 py-3 font-medium text-gray-600">Read</th><th className="px-4 py-3 font-medium text-gray-600">Date</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              notifications.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No notifications</td></tr> :
              notifications.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{n.user?.firstName || '—'} {n.user?.lastName || ''}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${NOTIF_COLORS[n.type] || ''}`}>{n.type}</span></td>
                  <td className="px-4 py-3 font-medium">{n.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{n.message}</td>
                  <td className="px-4 py-3">{n.isRead ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400 text-xs">{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <button onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Previous</button>}
          <span className="self-center text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
          {page < Math.ceil(total / limit) && <button onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Next</button>}
        </div>
      )}
    </div>
  );
}
