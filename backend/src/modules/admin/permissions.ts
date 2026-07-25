export type Permission =
  | 'dashboard:view'
  | 'users:view'
  | 'users:edit'
  | 'users:suspend'
  | 'users:reset'
  | 'users:delete'
  | 'tasks:view'
  | 'tasks:edit'
  | 'tasks:cancel'
  | 'tasks:reassign'
  | 'taskers:view'
  | 'taskers:verify'
  | 'taskers:suspend'
  | 'payments:view'
  | 'payments:refund'
  | 'payouts:approve'
  | 'notifications:send'
  | 'notifications:broadcast'
  | 'support:view'
  | 'support:resolve'
  | 'reports:view'
  | 'reports:export'
  | 'audit:view'
  | 'admins:manage'
  | 'settings:view'
  | 'settings:edit'
  | 'analytics:view'
  | 'analytics:manage';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard:view',
    'users:view',
    'users:edit',
    'users:suspend',
    'users:reset',
    'users:delete',
    'tasks:view',
    'tasks:edit',
    'tasks:cancel',
    'tasks:reassign',
    'taskers:view',
    'taskers:verify',
    'taskers:suspend',
    'payments:view',
    'payments:refund',
    'payouts:approve',
    'notifications:send',
    'notifications:broadcast',
    'support:view',
    'support:resolve',
    'reports:view',
    'reports:export',
    'audit:view',
    'admins:manage',
    'settings:view',
    'settings:edit',
    'analytics:view',
    'analytics:manage',
  ],
  ADMIN: [
    'dashboard:view',
    'users:view',
    'users:edit',
    'users:suspend',
    'users:reset',
    'tasks:view',
    'tasks:edit',
    'tasks:cancel',
    'taskers:view',
    'taskers:verify',
    'taskers:suspend',
    'payments:view',
    'payments:refund',
    'payouts:approve',
    'notifications:send',
    'notifications:broadcast',
    'support:view',
    'support:resolve',
    'reports:view',
    'reports:export',
    'audit:view',
    'settings:view',
    'settings:edit',
    'analytics:view',
    'analytics:manage',
  ],
  MODERATOR: [
    'dashboard:view',
    'users:view',
    'tasks:view',
    'tasks:edit',
    'taskers:view',
    'taskers:verify',
    'payments:view',
    'support:view',
    'support:resolve',
    'reports:view',
    'analytics:view',
  ],
  SUPPORT: [
    'dashboard:view',
    'users:view',
    'tasks:view',
    'taskers:view',
    'payments:view',
    'support:view',
    'support:resolve',
    'reports:view',
    'analytics:view',
  ],
};

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: string, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}
