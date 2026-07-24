import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAuditLogs } from '../api/client';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700', UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700', LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-700', SUSPEND: 'bg-red-100 text-red-700',
  ACTIVATE: 'bg-teal-100 text-teal-700', APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700', CANCEL: 'bg-gray-100 text-gray-700',
  REFUND: 'bg-purple-100 text-purple-700',
};

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const action = searchParams.get('action') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 30;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditLogs({ action: action || undefined, limit, offset: (page - 1) * limit });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [action, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs ({total})</h1>
        <select value={action} onChange={(e) => setSearchParams(prev => { prev.set('action', e.target.value); prev.set('page', '1'); return prev; })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="APPROVE">Approve</option>
          <option value="REJECT">Reject</option>
          <option value="SUSPEND">Suspend</option>
          <option value="ACTIVATE">Activate</option>
          <option value="CANCEL">Cancel</option>
          <option value="REFUND">Refund</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="space-y-2 p-4">
          {loading ? <p className="text-center text-gray-400">Loading...</p> :
            logs.length === 0 ? <p className="text-center text-gray-400">No audit logs found</p> :
            logs.map((log) => (
              <div key={log.id} className="rounded-lg border bg-white p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</span>
                    <span className="font-medium text-gray-800">{log.entity}</span>
                    {log.entityId && <span className="font-mono text-xs text-gray-400">#{log.entityId.slice(0, 8)}</span>}
                    <span className="text-gray-500">{log.adminUser || 'System'}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                {log.details && <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs text-gray-600">{JSON.stringify(log.details, null, 2)}</pre>}
                {log.ipAddress && <p className="mt-1 text-xs text-gray-400">IP: {log.ipAddress}</p>}
              </div>
            ))}
        </div>
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
