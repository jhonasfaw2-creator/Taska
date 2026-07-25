import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
  getDashboardStats, getUserAnalytics, getTaskAnalytics, getRevenueAnalytics,
  getAnalyticsUserGrowth, getAnalyticsTaskGrowth, getAnalyticsRevenueTrend,
  getAnalyticsPopularCategories,
} from '../api/client';
import type { DashboardStats, UserAnalytics, TaskAnalytics, RevenueAnalytics, GrowthPoint, CategoryCount } from '../types';

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

function Section({ title, children, loading, error }: { title: string; children: React.ReactNode; loading?: boolean; error?: string | null }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      ) : children}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userAna, setUserAna] = useState<UserAnalytics | null>(null);
  const [taskAna, setTaskAna] = useState<TaskAnalytics | null>(null);
  const [revAna, setRevAna] = useState<RevenueAnalytics | null>(null);
  const [userGrowth, setUserGrowth] = useState<GrowthPoint[]>([]);
  const [taskGrowth, setTaskGrowth] = useState<GrowthPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<GrowthPoint[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErrors({});

    const pAdmin = getDashboardStats().then(setStats).catch(() => setErrors((e) => ({ ...e, stats: 'Failed to load dashboard stats' })));
    const pUserAna = getUserAnalytics().then(setUserAna).catch(() => setErrors((e) => ({ ...e, userAna: 'Failed to load user analytics' })));
    const pTaskAna = getTaskAnalytics().then(setTaskAna).catch(() => setErrors((e) => ({ ...e, taskAna: 'Failed to load task analytics' })));
    const pRevAna = getRevenueAnalytics().then(setRevAna).catch(() => setErrors((e) => ({ ...e, revAna: 'Failed to load revenue analytics' })));
    const pUserG = getAnalyticsUserGrowth(30).then(setUserGrowth).catch(() => setErrors((e) => ({ ...e, userGrowth: 'Failed to load user growth chart' })));
    const pTaskG = getAnalyticsTaskGrowth(30).then(setTaskGrowth).catch(() => setErrors((e) => ({ ...e, taskGrowth: 'Failed to load task growth chart' })));
    const pRevT = getAnalyticsRevenueTrend(30).then(setRevenueTrend).catch(() => setErrors((e) => ({ ...e, revenueTrend: 'Failed to load revenue trend' })));
    const pCat = getAnalyticsPopularCategories().then(setCategories).catch(() => setErrors((e) => ({ ...e, categories: 'Failed to load categories' })));

    Promise.allSettled([pAdmin, pUserAna, pTaskAna, pRevAna, pUserG, pTaskG, pRevT, pCat])
      .then(() => setInitialLoad(false))
      .finally(() => setLoading(false));
  }, []);

  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-6 w-6 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={String(stats?.totalUsers ?? userAna?.totalUsers ?? 0)}
          subtitle={`${userAna?.totalCustomers ?? stats?.activeCustomers ?? 0} customers, ${userAna?.totalTaskers ?? stats?.activeTaskers ?? 0} taskers`} />
        <StatCard title="Online Taskers" value={String(stats?.onlineTaskers ?? userAna?.onlineTaskers ?? 0)}
          subtitle={`${stats?.pendingVerifications ?? 0} pending verifications`} color="text-green-600" />
        <StatCard title="Revenue Today" value={`ETB ${Number(revAna?.revenueToday ?? stats?.revenueToday ?? 0).toFixed(2)}`}
          subtitle={`This month: ETB ${Number(revAna?.revenueThisMonth ?? stats?.revenueThisMonth ?? 0).toFixed(2)}`} color="text-primary-600" />
        <StatCard title="Tasks Today" value={String(taskAna?.tasksCreatedToday ?? stats?.tasksToday ?? 0)}
          subtitle={`${taskAna?.inProgressTasks ?? stats?.tasksInProgress ?? 0} in progress`} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Completed Tasks" value={String(taskAna?.completedTasks ?? stats?.completedTasks ?? 0)} />
        <StatCard title="Cancelled Tasks" value={String(taskAna?.cancelledTasks ?? stats?.cancelledTasks ?? 0)} color="text-red-600" />
        <StatCard title="Wallet Balances" value={`ETB ${Number(stats?.totalWalletBalance ?? 0).toFixed(2)}`} subtitle={`Available: ETB ${Number(stats?.totalAvailableBalance ?? 0).toFixed(2)}`} />
        <StatCard title="Pending Payouts" value={`ETB ${Number(revAna?.pendingPayouts ?? stats?.totalPendingBalance ?? 0).toFixed(2)}`} color="text-amber-600" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Section title="User Summary" loading={loading && !userAna} error={errors.userAna}>
          {userAna && (
            <div className="space-y-3">
              <MiniStat label="Total Users" value={String(userAna.totalUsers)} />
              <MiniStat label="Customers" value={String(userAna.totalCustomers)} />
              <MiniStat label="Taskers" value={String(userAna.totalTaskers)} />
              <MiniStat label="New This Week" value={String(userAna.newUsersThisWeek)} color="text-green-600" />
            </div>
          )}
        </Section>
        <Section title="Task Summary" loading={loading && !taskAna} error={errors.taskAna}>
          {taskAna && (
            <div className="space-y-3">
              <MiniStat label="Total Tasks" value={String(taskAna.totalTasks)} />
              <MiniStat label="Pending" value={String(taskAna.pendingTasks)} color="text-amber-600" />
              <MiniStat label="In Progress" value={String(taskAna.inProgressTasks)} color="text-blue-600" />
              <MiniStat label="Completed Today" value={String(taskAna.tasksCompletedToday)} color="text-green-600" />
            </div>
          )}
        </Section>
        <Section title="Revenue Summary" loading={loading && !revAna} error={errors.revAna}>
          {revAna && (
            <div className="space-y-3">
              <MiniStat label="Total Platform Revenue" value={`ETB ${Number(revAna.totalPlatformRevenue).toFixed(2)}`} />
              <MiniStat label="Platform Fees" value={`ETB ${Number(revAna.platformFeesCollected).toFixed(2)}`} />
              <MiniStat label="This Week" value={`ETB ${Number(revAna.revenueThisWeek).toFixed(2)}`} color="text-primary-600" />
              <MiniStat label="Pending Payouts" value={`ETB ${Number(revAna.pendingPayouts).toFixed(2)}`} color="text-amber-600" />
            </div>
          )}
        </Section>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Section title="User Growth (30 days)" loading={loading && userGrowth.length === 0} error={errors.userGrowth}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </Section>
        <Section title="Revenue Trend (30 days)" loading={loading && revenueTrend.length === 0} error={errors.revenueTrend}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Section title="Task Growth (30 days)" loading={loading && taskGrowth.length === 0} error={errors.taskGrowth}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={taskGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </Section>
        <Section title="Task Categories" loading={loading && categories.length === 0} error={errors.categories}>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}><Pie dataKey="count">{categories.map((_, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></Pie></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400">No categories data</p>}
        </Section>
      </div>
    </div>
  );
}
