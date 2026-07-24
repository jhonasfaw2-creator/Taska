import { useEffect, useState, useCallback } from 'react';
import { exportReports, getReportData, getGrowthReport } from '../api/client';

type ReportTab = 'revenue' | 'users' | 'tasks' | 'payments' | 'growth';

const TABS: { key: ReportTab; label: string; icon: string }[] = [
  { key: 'revenue', label: 'Revenue', icon: '💰' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'tasks', label: 'Tasks', icon: '📋' },
  { key: 'payments', label: 'Payments', icon: '💳' },
  { key: 'growth', label: 'Growth', icon: '📈' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [format, setFormat] = useState('CSV');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Report data
  const [reportData, setReportData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Growth data
  const [growthData, setGrowthData] = useState<any>(null);
  const [growthDays, setGrowthDays] = useState(30);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchData = useCallback(async () => {
    if (activeTab === 'growth') {
      setFetchLoading(true);
      try {
        const data = await getGrowthReport(growthDays);
        setGrowthData(data);
        setReportData(null);
      } catch (err: any) {
        showMsg('error', err.response?.data?.error || 'Failed to load growth data');
      } finally { setFetchLoading(false); }
      return;
    }

    setFetchLoading(true);
    try {
      const params: Record<string, any> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (activeTab === 'revenue') params.groupBy = 'day';
      const data = await getReportData(activeTab, params);
      setReportData(data);
      setGrowthData(null);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Failed to load report data');
    } finally { setFetchLoading(false); }
  }, [activeTab, dateFrom, dateTo, growthDays]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const fmt = format.toLowerCase();
      const exportParams: Record<string, any> = {
        type: activeTab,
        format: fmt,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      if (activeTab === 'growth') {
        exportParams.days = growthDays;
      }
      const blob: Blob = await exportReports(exportParams as any);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = fmt === 'xlsx' ? 'xlsx' : fmt === 'pdf' ? 'pdf' : 'csv';
      a.download = `${activeTab}-report-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      showMsg('success', `Report exported as ${format}`);
    } catch (err: any) {
      showMsg('error', err.response?.data?.error || 'Export failed');
    } finally { setLoading(false); }
  };

  const renderSummaryCards = () => {
    if (!reportData) return null;
    const fields = Object.keys(reportData).filter((k) => k !== 'data' && k !== 'byStatus' && k !== 'count');
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {fields.map((field) => (
          <div key={field} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {typeof reportData[field] === 'number'
                ? field.toLowerCase().includes('revenue') || field.toLowerCase().includes('fee')
                  ? `ETB ${Number(reportData[field]).toFixed(2)}`
                  : Number(reportData[field]).toLocaleString()
                : String(reportData[field] || '—')}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderDataTable = () => {
    if (!reportData?.data || !Array.isArray(reportData.data) || reportData.data.length === 0) return null;
    const keys = Object.keys(reportData.data[0]);
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider">
                  {k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {reportData.data.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {keys.map((k) => (
                  <td key={k} className="px-4 py-2 text-gray-700">
                    {typeof row[k] === 'number' && (k.toLowerCase().includes('revenue') || k.toLowerCase().includes('fee'))
                      ? `ETB ${Number(row[k]).toFixed(2)}`
                      : String(row[k] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-xs text-gray-400 border-t">
          {reportData.data.length} rows
        </p>
      </div>
    );
  };

  const renderStatusBreakdown = () => {
    if (!reportData?.byStatus) return null;
    const entries = Object.entries(reportData.byStatus) as [string, number][];
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
        <div className="space-y-2">
          {entries.map(([status, count]) => {
            const pct = reportData.total > 0 ? (count / reportData.total * 100).toFixed(1) : '0';
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600">{status}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === 'COMPLETED' ? 'bg-green-500' :
                      status === 'CANCELLED' ? 'bg-red-500' :
                      status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-medium text-gray-700">{count}</span>
                <span className="w-12 text-right text-xs text-gray-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGrowthData = () => {
    if (!growthData) return null;
    const { summary, userGrowth, taskGrowth, revenueGrowth } = growthData;

    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Users ({growthDays}d)</p>
            <p className="mt-1 text-xl font-bold text-blue-600">{summary.totalNewUsers}</p>
            <p className="text-xs text-gray-400">~{summary.avgDailyUsers}/day</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Tasks ({growthDays}d)</p>
            <p className="mt-1 text-xl font-bold text-purple-600">{summary.totalNewTasks}</p>
            <p className="text-xs text-gray-400">~{summary.avgDailyTasks}/day</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue ({growthDays}d)</p>
            <p className="mt-1 text-xl font-bold text-green-600">ETB {summary.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400">~ETB {summary.avgDailyRevenue.toFixed(2)}/day</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'User Growth', data: userGrowth, color: 'text-blue-600' },
            { label: 'Task Growth', data: taskGrowth, color: 'text-purple-600' },
            { label: 'Revenue Growth', data: revenueGrowth, color: 'text-green-600' },
          ].map(({ label, data, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
              {data && data.length > 0 ? (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {data.filter((_: any, i: number) => i % Math.max(1, Math.floor(data.length / 30)) === 0 || i === data.length - 1).map((point: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-gray-500">{point.date?.slice(5) || point.date}</span>
                      <span className={`font-medium ${color}`}>
                        {label === 'Revenue Growth' ? `ETB ${point.value.toFixed(2)}` : point.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No data available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNoData = () => (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg mb-1">No data available for this period</p>
      <p className="text-sm">Try adjusting the date range or selecting a different report</p>
    </div>
  );

  const isGrowthTab = activeTab === 'growth';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">View and export platform reports</p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">Export Format</label>
            <div className="flex gap-2">
              {['CSV', 'XLSX', 'PDF'].map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    format === f
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          {isGrowthTab && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Period (Days)</label>
              <select value={growthDays} onChange={(e) => setGrowthDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          )}
          <div>
            <button onClick={handleExport} disabled={loading}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Exporting...
                </span>
              ) : `Export ${format}`}
            </button>
          </div>
        </div>
        {message && (
          <div className={`mt-3 rounded-lg p-3 text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 pb-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {fetchLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <svg className="h-5 w-5 animate-spin mr-2 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading report data...
        </div>
      ) : isGrowthTab ? (
        growthData ? renderGrowthData() : renderNoData()
      ) : (
        <div>
          {reportData ? (
            <>
              {renderSummaryCards()}
              {reportData.byStatus ? renderStatusBreakdown() : null}
              {renderDataTable()}
              {!reportData.data && !reportData.byStatus && renderNoData()}
            </>
          ) : (
            renderNoData()
          )}
        </div>
      )}
    </div>
  );
}
