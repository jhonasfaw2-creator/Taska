import { prisma } from '../../prisma/client';
import { AppError, JwtPayload } from '../../common/types';

interface ProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

export const getProfile = async (user: JwtPayload) => {
  const profile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
      isOnboarded: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new AppError('User not found.', 404);
  }

  return profile;
};

export const updateProfile = async (user: JwtPayload, input: ProfileInput) => {
  const updated = await prisma.user.update({
    where: { id: user.userId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.profileImage !== undefined && { profileImage: input.profileImage }),
    },
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
      isOnboarded: true,
    },
  });

  return updated;
};

export const updateRole = async (user: JwtPayload, role: string) => {
  const normalized = role.toUpperCase();

  if (normalized !== 'CUSTOMER' && normalized !== 'TASKER') {
    throw new AppError('Invalid role. Must be CUSTOMER or TASKER.', 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.userId },
    data: { role: normalized as 'CUSTOMER' | 'TASKER' },
    select: {
      id: true,
      phoneNumber: true,
      role: true,
    },
  });

  return updated;
};
