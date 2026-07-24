import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, getUserGrowth, getTaskGrowth, getRevenueGrowth, getCategoryDistribution } from '../api/client';
import type { DashboardStats } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [taskGrowth, setTaskGrowth] = useState<any[]>([]);
  const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(), getUserGrowth(30), getTaskGrowth(30), getRevenueGrowth(30), getCategoryDistribution(),
    ]).then(([s, ug, tg, rg, cat]) => {
      setStats(s); setUserGrowth(ug); setTaskGrowth(tg); setRevenueGrowth(rg); setCategories(cat);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading dashboard...</p></div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={String(stats?.totalUsers ?? 0)} subtitle={`${stats?.activeCustomers ?? 0} customers, ${stats?.activeTaskers ?? 0} taskers`} />
        <StatCard title="Online Taskers" value={String(stats?.onlineTaskers ?? 0)} subtitle={`${stats?.pendingVerifications ?? 0} pending verifications`} color="text-green-600" />
        <StatCard title="Revenue Today" value={`ETB ${Number(stats?.revenueToday ?? 0).toFixed(2)}`} subtitle={`This month: ETB ${Number(stats?.revenueThisMonth ?? 0).toFixed(2)}`} color="text-primary-600" />
        <StatCard title="Tasks Today" value={String(stats?.tasksToday ?? 0)} subtitle={`${stats?.tasksInProgress ?? 0} in progress`} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Completed Tasks" value={String(stats?.completedTasks ?? 0)} />
        <StatCard title="Cancelled Tasks" value={String(stats?.cancelledTasks ?? 0)} color="text-red-600" />
        <StatCard title="Wallet Balances" value={`ETB ${Number(stats?.totalWalletBalance ?? 0).toFixed(2)}`} subtitle={`Available: ETB ${Number(stats?.totalAvailableBalance ?? 0).toFixed(2)}`} />
        <StatCard title="Pending Payouts" value={`ETB ${Number(stats?.totalPendingBalance ?? 0).toFixed(2)}`} color="text-amber-600" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">User Growth (30 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Revenue Growth (30 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Task Growth (30 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={taskGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Task Categories</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}><Pie dataKey="count">{categories.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></Pie></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400">No categories data</p>}
        </div>
      </div>
    </div>
  );
}
