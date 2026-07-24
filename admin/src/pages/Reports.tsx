import { useState } from 'react';
import { exportReports } from '../api/client';

export default function Reports() {
  const [format, setFormat] = useState('CSV');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [type, setType] = useState('PAYMENTS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const blob = await exportReports({ type, format, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${type.toLowerCase()}-${Date.now()}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`Report exported as ${format}`);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Export failed');
    }
    finally { setLoading(false); }
  };

  const stats = [
    { label: 'Total Users', paid: '—', pending: '—', description: 'All registered users' },
    { label: 'Total Taskers', paid: '—', pending: '—', description: 'All approved taskers' },
    { label: 'Total Tasks', paid: '—', pending: '—', description: 'All tasks posted' },
    { label: 'Total Payments', paid: '—', pending: '—', description: 'Total payment volume' },
    { label: 'Platform Revenue', paid: '—', pending: '—', description: 'Total platform fees' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reports</h1>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Export Data</h2>
        {message && <div className={`mb-3 rounded-lg p-2 text-sm ${message.includes('failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message}</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Report Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="PAYMENTS">Payments</option>
              <option value="USERS">Users</option>
              <option value="TASKS">Tasks</option>
              <option value="TASKERS">Taskers</option>
              <option value="REVENUE">Revenue</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="CSV">CSV</option>
              <option value="XLSX">Excel (XLSX)</option>
              <option value="PDF">PDF</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={handleExport} disabled={loading} className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Platform Statistics</h2>
        <p className="mb-4 text-sm text-gray-500">Connect to admin API to view real-time statistics (placeholder shown).</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr><th className="px-4 py-3 font-medium text-gray-600">Metric</th><th className="px-4 py-3 font-medium text-gray-600">Value</th><th className="px-4 py-3 font-medium text-gray-600">Description</th></tr>
            </thead>
            <tbody className="divide-y">
              {stats.map((s) => (
                <tr key={s.label} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.label}</td>
                  <td className="px-4 py-3 text-gray-600">{s.paid}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
