import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export async function login(phoneNumber: string, password: string) {
  const res = await api.post('/admin/auth/login', { phoneNumber, password });
  return res.data.data;
}

export async function getDashboardStats() {
  const res = await api.get('/admin/dashboard/stats');
  return res.data.data;
}

export async function getUserGrowth(days = 30) {
  const res = await api.get('/admin/dashboard/user-growth', { params: { days } });
  return res.data.data;
}

export async function getTaskGrowth(days = 30) {
  const res = await api.get('/admin/dashboard/task-growth', { params: { days } });
  return res.data.data;
}

export async function getRevenueGrowth(days = 30) {
  const res = await api.get('/admin/dashboard/revenue-growth', { params: { days } });
  return res.data.data;
}

export async function getCategoryDistribution() {
  const res = await api.get('/admin/dashboard/category-distribution');
  return res.data.data;
}

export async function listUsers(params: Record<string, any>) {
  const res = await api.get('/admin/users', { params });
  return res.data.data;
}

export async function getUserDetails(id: string) {
  const res = await api.get(`/admin/users/${id}`);
  return res.data.data;
}

export async function updateUser(id: string, data: Record<string, any>) {
  const res = await api.patch(`/admin/users/${id}`, data);
  return res.data.data;
}

export async function suspendUser(id: string) {
  const res = await api.post(`/admin/users/${id}/suspend`);
  return res.data.data;
}

export async function reactivateUser(id: string) {
  const res = await api.post(`/admin/users/${id}/reactivate`);
  return res.data.data;
}

export async function deleteUser(id: string) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export async function resetUserVerification(id: string) {
  const res = await api.post(`/admin/users/${id}/reset-verification`);
  return res.data.data;
}

export async function resetUserAccount(id: string) {
  const res = await api.post(`/admin/users/${id}/reset-account`);
  return res.data.data;
}

export async function listTasks(params: Record<string, any>) {
  const res = await api.get('/admin/tasks', { params });
  return res.data.data;
}

export async function getTaskDetails(id: string) {
  const res = await api.get(`/admin/tasks/${id}`);
  return res.data.data;
}

export async function cancelTask(id: string, reason: string) {
  const res = await api.post(`/admin/tasks/${id}/cancel`, { reason });
  return res.data.data;
}

export async function reassignTask(id: string, taskerId: string) {
  const res = await api.post(`/admin/tasks/${id}/reassign`, { taskerId });
  return res.data.data;
}

export async function resolveDispute(id: string, resolution: string, action: string) {
  const res = await api.post(`/admin/tasks/${id}/resolve-dispute`, { resolution, action });
  return res.data.data;
}

export async function listTaskers(params: Record<string, any>) {
  const res = await api.get('/admin/taskers', { params });
  return res.data.data;
}

export async function getTaskerDetails(id: string) {
  const res = await api.get(`/admin/taskers/${id}`);
  return res.data.data;
}

export async function approveTasker(id: string) {
  const res = await api.post(`/admin/taskers/${id}/approve`);
  return res.data.data;
}

export async function rejectTasker(id: string) {
  const res = await api.post(`/admin/taskers/${id}/reject`);
  return res.data.data;
}

export async function suspendTasker(id: string) {
  const res = await api.post(`/admin/taskers/${id}/suspend`);
  return res.data.data;
}

export async function listAdminPayments(params: Record<string, any>) {
  const res = await api.get('/admin/payments', { params });
  return res.data.data;
}

export async function getPaymentDetails(id: string) {
  const res = await api.get(`/admin/payments/${id}`);
  return res.data.data;
}

export async function processRefund(id: string, amount: number, reason: string) {
  const res = await api.post(`/admin/payments/${id}/refund`, { amount, reason });
  return res.data.data;
}

export async function listWallets(params: Record<string, any>) {
  const res = await api.get('/admin/wallets', { params });
  return res.data.data;
}

export async function approvePayout(walletId: string, amount: number) {
  const res = await api.post('/admin/payouts/approve', { walletId, amount });
  return res.data.data;
}

export async function getWalletTransactions(walletId: string, params: Record<string, any> = {}) {
  const res = await api.get(`/admin/wallets/${walletId}/transactions`, { params });
  return res.data.data;
}

export async function sendTargetedNotification(userIds: string[], title: string, message: string) {
  const res = await api.post('/admin/notifications/targeted', { userIds, title, message });
  return res.data.data;
}

export async function sendNotification(userId: string, title: string, message: string) {
  const res = await api.post('/admin/notifications/send', { userId, title, message });
  return res.data.data;
}

export async function broadcastNotification(title: string, message: string, roleFilter = 'ALL') {
  const res = await api.post('/admin/notifications/broadcast', { title, message, roleFilter });
  return res.data.data;
}

export async function getRevenueReport(params: Record<string, any>) {
  const res = await api.get('/admin/reports/revenue', { params });
  return res.data.data;
}

export async function getUsersReport(params: Record<string, any>) {
  const res = await api.get('/admin/reports/users', { params });
  return res.data.data;
}

export async function getTasksReport(params: Record<string, any>) {
  const res = await api.get('/admin/reports/tasks', { params });
  return res.data.data;
}

export async function getPaymentsReport(params: Record<string, any>) {
  const res = await api.get('/admin/reports/payments', { params });
  return res.data.data;
}

export async function listAuditLogs(params: Record<string, any>) {
  const res = await api.get('/admin/audit-logs', { params });
  return res.data.data;
}

export async function listAdminUsers(params: Record<string, any> = {}) {
  const res = await api.get('/admin/admins', { params });
  return res.data.data;
}

export async function createAdminUser(data: { userId: string; role: string }) {
  const res = await api.post('/admin/admins', data);
  return res.data.data;
}

export async function updateAdminUserRole(id: string, role: string) {
  const res = await api.patch(`/admin/admins/${id}/role`, { role });
  return res.data.data;
}

export async function deleteAdminUser(id: string) {
  const res = await api.delete(`/admin/admins/${id}`);
  return res.data;
}

export async function listAdminNotifications(params: Record<string, any> = {}) {
  const res = await api.get('/admin/notifications', { params });
  return res.data.data;
}

export async function sendAdminNotification(data: { title: string; message: string; roleFilter?: string }) {
  const res = await api.post('/admin/notifications/broadcast', data);
  return res.data.data;
}

export async function exportReports(params: { type: string; format?: string; dateFrom?: string; dateTo?: string }) {
  const res = await api.get('/admin/reports/export', { params, responseType: 'blob' });
  return res.data;
}

export async function getReportData(type: string, params: Record<string, any> = {}) {
  const res = await api.get(`/admin/reports/${type}`, { params });
  return res.data.data;
}

export async function getGrowthReport(days = 30) {
  const res = await api.get('/admin/reports/growth', { params: { days } });
  return res.data.data;
}

export async function getUserAnalytics() {
  const res = await api.get('/analytics/users');
  return res.data.data;
}

export async function getTaskAnalytics() {
  const res = await api.get('/analytics/tasks');
  return res.data.data;
}

export async function getRevenueAnalytics() {
  const res = await api.get('/analytics/revenue');
  return res.data.data;
}

export async function getAnalyticsUserGrowth(days = 30) {
  const res = await api.get('/analytics/charts/user-growth', { params: { days } });
  return res.data.data;
}

export async function getAnalyticsTaskGrowth(days = 30) {
  const res = await api.get('/analytics/charts/task-growth', { params: { days } });
  return res.data.data;
}

export async function getAnalyticsRevenueTrend(days = 30) {
  const res = await api.get('/analytics/charts/revenue-trend', { params: { days } });
  return res.data.data;
}

export async function getAnalyticsPopularCategories() {
  const res = await api.get('/analytics/charts/popular-categories');
  return res.data.data;
}

export default api;
