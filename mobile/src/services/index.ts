export {
  sendOTP,
  verifyOTP,
  hasSession,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
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
export {
  uploadImage,
  uploadMultipleImages,
  deleteMedia,
  getMedia,
  validateImage,
  compressImage,
} from './media.service';

export type { MediaRecord, UploadProgress } from '../types/media';

export type { SendOtpResponse, VerifyOtpResponse, UserSession, UserProfile } from '../types/auth';
