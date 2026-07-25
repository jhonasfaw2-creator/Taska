import { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/tasks', label: 'Tasks', icon: '📋' },
  { path: '/taskers', label: 'Taskers', icon: '🛵' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/wallets', label: 'Wallets', icon: '💰' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/support', label: 'Support', icon: '🎧' },
  { path: '/audit-logs', label: 'Audit Logs', icon: '📝' },
  { path: '/admins', label: 'Admin Users', icon: '🔐' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('admin_user') || '{}'); }
    catch { return {}; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-bold text-primary-600">Taska Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">&times;</button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">{user.firstName || user.phoneNumber || 'Admin'}</span>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">{user.role || 'ADMIN'}</span>
            <button onClick={handleLogout} className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Logout</button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
