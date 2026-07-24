import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskDetails, cancelTask } from '../api/client';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!id) return;
    getTaskDetails(id).then(setTask).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return alert('Please enter a reason');
    try { await cancelTask(id!, cancelReason); setTask((prev: any) => ({ ...prev, status: 'CANCELLED' })); setCancelReason(''); }
    catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!task) return <p className="text-red-500">Task not found</p>;

  return (
    <div>
      <button onClick={() => navigate('/tasks')} className="mb-4 text-sm text-primary-600 hover:underline">&larr; Back to Tasks</button>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="mt-1 text-gray-500">{task.description}</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">{task.category?.name}</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{task.status}</span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">ETB {Number(task.estimatedPrice).toFixed(2)}</span>
            </div>
          </div>
          {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
            <div className="flex gap-2">
              <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cancel reason..." className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <button onClick={handleCancel} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Cancel Task</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Location</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Pickup:</span> {task.pickupAddress}</p>
            <p><span className="text-gray-500">Dropoff:</span> {task.dropoffAddress}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">People</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Customer:</span> {task.customer?.firstName || 'Unknown'} ({task.customer?.phoneNumber})</p>
            <p><span className="text-gray-500">Tasker:</span> {task.tasker?.user?.firstName || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {task.statusHistory && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Status History</h2>
          <div className="space-y-2">
            {task.statusHistory.map((h: any) => (
              <div key={h.id} className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                <span className="font-medium">{h.status}</span>
                <span className="text-gray-400">by {h.changedBy}</span>
                <span className="text-gray-400 text-xs">{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
