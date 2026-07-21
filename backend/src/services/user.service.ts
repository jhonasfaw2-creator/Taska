import { prisma } from '../prisma/client';
import { AppError, JwtPayload } from '../types';

// ─── Types ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  profileImage: string | null;
  role: string;
  isVerified: boolean;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

// ─── Validation helpers ───────────────────────────────

const VALID_ROLES = ['CUSTOMER', 'TASKER'] as const;
type AllowedRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string): role is AllowedRole {
  return VALID_ROLES.includes(role as AllowedRole);
}

// ─── Public API ────────────────────────────────────────

/**
 * Fetch the full profile of the currently authenticated user.
 */
export async function getProfile(user: JwtPayload): Promise<UserProfile> {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      profileImage: true,
      role: true,
      isVerified: true,
    },
  });

  if (!dbUser) {
    throw new AppError('User not found.', 404);
  }

  return {
    id: dbUser.id,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    phoneNumber: dbUser.phoneNumber,
    email: dbUser.email,
    profileImage: dbUser.profileImage,
    role: dbUser.role,
    isVerified: dbUser.isVerified,
  };
}

/**
 * Update the authenticated user's profile fields.
 * Only the fields provided in `data` will be updated.
 */
export async function updateProfile(
  user: JwtPayload,
  data: UpdateProfileInput,
): Promise<UserProfile> {
  // Build the update payload with only the provided fields
  const updateData: Record<string, string> = {};

  if (data.firstName !== undefined) {
    if (!data.firstName.trim()) {
      throw new AppError('First name cannot be empty.', 400);
    }
    updateData.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    if (!data.lastName.trim()) {
      throw new AppError('Last name cannot be empty.', 400);
    }
    updateData.lastName = data.lastName.trim();
  }

  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new AppError('Invalid email format.', 400);
    }
    updateData.email = data.email.trim();
  }

  if (data.profileImage !== undefined) {
    if (!data.profileImage.trim()) {
      throw new AppError('Profile image URL cannot be empty.', 400);
    }
    updateData.profileImage = data.profileImage.trim();
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields provided for update.', 400);
  }

  const dbUser = await prisma.user.update({
    where: { id: user.userId },
    data: updateData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      profileImage: true,
      role: true,
      isVerified: true,
    },
  });

  return {
    id: dbUser.id,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    phoneNumber: dbUser.phoneNumber,
    email: dbUser.email,
    profileImage: dbUser.profileImage,
    role: dbUser.role,
    isVerified: dbUser.isVerified,
  };
}

/**
 * Update the authenticated user's role to either CUSTOMER or TASKER.
 * Triggers creation of a TaskerProfile when switching to TASKER for the
 * first time.
 */
export async function updateRole(
  user: JwtPayload,
  role: string,
): Promise<{ role: string }> {
  const normalizedRole = role?.toUpperCase();

  if (!isValidRole(normalizedRole)) {
    throw new AppError(
      `Invalid role "${role}". Allowed values: ${VALID_ROLES.join(', ')}.`,
      400,
    );
  }

  const dbUser = await prisma.user.update({
    where: { id: user.userId },
    data: { role: normalizedRole as 'CUSTOMER' | 'TASKER' },
    select: { role: true },
  });

  return { role: dbUser.role };
}
