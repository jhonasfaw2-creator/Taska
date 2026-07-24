import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, updateUser, suspendUser, reactivateUser, deleteUser, resetUserVerification, resetUserAccount } from '../api/client';

import ConfirmModal from '../components/ConfirmModal';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate' | 'delete' | 'reset-verification' | 'reset-account';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getUserDetails(id!);
      setUser(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
      });
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateUser(id!, form);
      setUser((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
      showMessage('success', 'User updated successfully.');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Update failed');
    }
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await suspendUser(id!);
      setUser((prev: any) => ({ ...prev, deletedAt: new Date().toISOString() }));
      showMessage('success', 'User suspended successfully.');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivateUser(id!);
      setUser((prev: any) => ({ ...prev, deletedAt: null }));
      showMessage('success', 'User reactivated successfully.');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to reactivate user');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(id!);
      navigate('/users');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to delete user');
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleResetVerification = async () => {
    setActionLoading(true);
    try {
      await resetUserVerification(id!);
      setUser((prev: any) => ({
        ...prev,
        isVerified: false,
        taskerProfile: prev.taskerProfile
          ? { ...prev.taskerProfile, verificationStatus: 'PENDING' }
          : prev.taskerProfile,
      }));
      showMessage('success', 'User verification has been reset.');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to reset verification');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleResetAccount = async () => {
    setActionLoading(true);
    try {
      await resetUserAccount(id!);
      await loadUser();
      showMessage('success', 'User account has been reset successfully.');
    } catch (err: any) {
      showMessage('error', err.response?.data?.error || 'Failed to reset account');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const getConfirmModalProps = () => {
    switch (confirmAction?.type) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: 'This will prevent the user from accessing the platform. They can be reactivated later.',
          confirmLabel: 'Suspend',
          confirmColor: 'amber' as const,
          onConfirm: handleSuspend,
        };
      case 'reactivate':
        return {
          title: 'Reactivate User',
          message: 'This will restore the user\'s access to the platform.',
          confirmLabel: 'Reactivate',
          confirmColor: 'blue' as const,
          onConfirm: handleReactivate,
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: 'This will permanently soft-delete this user. This action cannot be undone.',
          confirmLabel: 'Delete',
          confirmColor: 'red' as const,
          onConfirm: handleDelete,
        };
      case 'reset-verification':
        return {
          title: 'Reset Verification',
          message: 'This will mark the user as unverified. If they have a tasker profile, its verification status will be set to pending.',
          confirmLabel: 'Reset',
          confirmColor: 'amber' as const,
          onConfirm: handleResetVerification,
        };
      case 'reset-account':
        return {
          title: 'Reset Account',
          message: 'This will clear the user\'s profile information, reset onboarding status, and remove verification. This action cannot be undone.',
          confirmLabel: 'Reset Account',
          confirmColor: 'red' as const,
          onConfirm: handleResetAccount,
        };
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading user details...
      </div>
    </div>
  );

  if (!user) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-600 font-medium">User not found</p>
      <button onClick={() => navigate('/users')} className="mt-2 text-sm text-red-500 hover:underline">
        Back to Users
      </button>
    </div>
  );

  const isTasker = user.role === 'TASKER' && user.taskerProfile;
  const isSuspended = !!user.deletedAt;
  const confirmProps = getConfirmModalProps();

  return (
    <div>
      <button onClick={() => navigate('/users')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </button>

      {message && (
        <div className={`mb-4 rounded-lg p-4 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* User Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {(user.firstName?.[0] || user.lastName?.[0] || user.phoneNumber[0]).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unnamed User'}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-gray-500">{user.phoneNumber}</span>
                {user.email && <span className="text-sm text-gray-400">·</span>}
                {user.email && <span className="text-sm text-gray-500">{user.email}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'TASKER' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unverified
                  </span>
                )}
                {isSuspended ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditing(!editing)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            {isSuspended ? (
              <button onClick={() => setConfirmAction({ type: 'reactivate' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reactivate
              </button>
            ) : (
              <button onClick={() => setConfirmAction({ type: 'suspend' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Suspend
              </button>
            )}
            <button onClick={() => setConfirmAction({ type: 'delete' })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit User
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleUpdate}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Save Changes
            </button>
            <button onClick={() => setEditing(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Actions */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2 mb-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-amber-700">These actions have significant impact on the user's account.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setConfirmAction({ type: 'reset-verification' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Reset Verification
          </button>
          <button onClick={() => setConfirmAction({ type: 'reset-account' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Account
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasker Profile */}
        {isTasker && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Tasker Profile
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Verification</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.taskerProfile.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  user.taskerProfile.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {user.taskerProfile.verificationStatus}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Rating</span>
                <span className="text-sm font-medium">{user.taskerProfile.rating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Completed Tasks</span>
                <span className="text-sm font-medium">{user.taskerProfile.totalTasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${user.taskerProfile.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className={`h-2 w-2 rounded-full ${user.taskerProfile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {user.taskerProfile.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {user.taskerProfile.bio && (
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500 block mb-1">Bio</span>
                  <span className="text-sm text-gray-900">{user.taskerProfile.bio}</span>
                </div>
              )}
              {user.taskerProfile.experience != null && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">Experience</span>
                  <span className="text-sm font-medium">{user.taskerProfile.experience} years</span>
                </div>
              )}
              {user.taskerProfile.wallet && (
                <div className="rounded-lg bg-blue-50 px-3 py-2">
                  <span className="text-sm text-blue-700 font-medium">Wallet Balance: {parseFloat(user.taskerProfile.wallet.balance).toFixed(2)} ETB</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Account Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-mono text-gray-700">{user.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-500">Joined</span>
              <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm font-medium">{new Date(user.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-500">Onboarded</span>
              <span className={`text-sm font-medium ${user.isOnboarded ? 'text-green-600' : 'text-gray-500'}`}>
                {user.isOnboarded ? 'Yes' : 'No'}
              </span>
            </div>
            {user._count && (
              <>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">Total Tasks</span>
                  <span className="text-sm font-medium">{user._count.tasks}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">Payments</span>
                  <span className="text-sm font-medium">{user._count.payments}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">Notifications</span>
                  <span className="text-sm font-medium">{user._count.notifications}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        {user.receivedReviews && user.receivedReviews.length > 0 && (
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Recent Reviews ({user.receivedReviews.length})
            </h2>
            <div className="space-y-3">
              {user.receivedReviews.map((review: any) => (
                <div key={review.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {review.reviewer?.firstName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-yellow-600">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmProps && (
        <ConfirmModal
          open
          loading={actionLoading}
          onCancel={() => setConfirmAction(null)}
          {...confirmProps}
        />
      )}
    </div>
  );
}
