export {
  sendOTP,
  verifyOTP,
  hasSession,
  getAccessToken,
  getStoredPhoneNumber,
  clearSession,
  getUserProfile,
  updateProfile,
  isProfileComplete,
} from './auth.service';

export { ApiError, setTokenProvider } from '../config/api';
export { fetchCategories } from './category.service';
export { fetchRecentTasks, createTask, getLastCreatedTaskId, updateTaskStatus, getTaskStatusHistory, getTaskById } from './task.service';
export { applyAsTasker, getTaskerProfile, updateOnlineStatus } from './tasker.service';
export {
  initializeNotifications,
  fetchNotifications,
  markNotificationRead,
  setUnreadCountListener,
} from './notification.service';

export type { SendOtpResponse, VerifyOtpResponse, UserSession, UserProfile } from '../types/auth';
