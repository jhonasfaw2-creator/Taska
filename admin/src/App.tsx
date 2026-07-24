import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Taskers from './pages/Taskers';
import TaskerDetail from './pages/TaskerDetail';
import Payments from './pages/Payments';
import PaymentDetail from './pages/PaymentDetail';
import Wallets from './pages/Wallets';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import AdminUsers from './pages/AdminUsers';
import Support from './pages/Support';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="taskers" element={<Taskers />} />
        <Route path="taskers/:id" element={<TaskerDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="payments/:id" element={<PaymentDetail />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="support" element={<Support />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="admins" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
