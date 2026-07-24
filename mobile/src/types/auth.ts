// ─── API Request / Response types ───────────────────────

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  message: string;
  otp?: string; // Only present in development mode
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyOtpResponse {
  user: {
    phoneNumber: string;
  };
  accessToken: string;
  refreshToken: string;
}

// ─── Auth error shape ───────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  error: string;
}

// ─── User session stored locally ────────────────────────

export interface UserSession {
  accessToken: string;
  phoneNumber: string;
}

// ─── User profile from GET /users/profile ────────────────

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  profileImage: string | null;
  role: string;
  isOnboarded: boolean;
}
