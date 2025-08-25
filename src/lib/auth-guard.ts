'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type UserRole = 'donor' | 'receiver' | 'coordinator' | 'admin';

export interface UserPermissions {
  canCreateDonations: boolean;
  canRequestDonations: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  donor: {
    canCreateDonations: true,
    canRequestDonations: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  receiver: {
    canCreateDonations: false,
    canRequestDonations: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  coordinator: {
    canCreateDonations: true,
    canRequestDonations: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canModerateContent: true,
  },
  admin: {
    canCreateDonations: true,
    canRequestDonations: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canModerateContent: true,
  },
};

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  donor: '/donor/dashboard',
  receiver: '/receiver/dashboard',
  coordinator: '/dashboard/city',
  admin: '/dashboard/admin',
};

class AuthGuard {
  private static instance: AuthGuard;
  private supabase = supabase;
  private currentUser: AuthUser | null = null;

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) return null;

      // Get user profile with role
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      const userRole = profile.role as UserRole;

      this.currentUser = {
        id: user.id,
        email: user.email || '',
        role: userRole,
        permissions: ROLE_PERMISSIONS[userRole],
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  hasPermission(permission: keyof UserPermissions): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions[permission];
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.currentUser) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.currentUser.role);
  }

  getAppropriateRedirect(): string {
    if (!this.currentUser) return '/auth/login';
    return ROLE_DASHBOARDS[this.currentUser.role] || '/';
  }

  handleAccessDenied(
    requiredPermission?: string,
    requiredRole?: UserRole | UserRole[]
  ) {
    const message = requiredPermission
      ? `Access denied - insufficient permissions: ${requiredPermission}`
      : requiredRole
        ? `Access denied - required role: ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}`
        : 'Access denied - please log in';

    toast({
      title: 'Access denied',
      description: 'Redirecting to your dashboard',
      variant: 'error',
    });

    // Redirect to appropriate dashboard after showing toast
    setTimeout(() => {
      const redirectUrl = this.getAppropriateRedirect();
      window.location.href = redirectUrl;
    }, 1500);
  }
}

// React hook for auth guard functionality
export function useAuthGuard(
  requiredPermission?: keyof UserPermissions,
  requiredRole?: UserRole | UserRole[]
) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const authGuard = AuthGuard.getInstance();

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authGuard.getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        let access = true;

        // Check permission if specified
        if (
          requiredPermission &&
          !authGuard.hasPermission(requiredPermission)
        ) {
          access = false;
        }

        // Check role if specified
        if (requiredRole && !authGuard.hasRole(requiredRole)) {
          access = false;
        }

        setHasAccess(access);

        // Handle access denied
        if (!access) {
          authGuard.handleAccessDenied(requiredPermission, requiredRole);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requiredPermission, requiredRole]);

  return {
    user,
    loading,
    hasAccess,
    hasPermission: (permission: keyof UserPermissions) =>
      authGuard.hasPermission(permission),
    hasRole: (role: UserRole | UserRole[]) => authGuard.hasRole(role),
  };
}

// Higher-order component for protecting routes
export function withAuthGuard<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission?: keyof UserPermissions,
  requiredRole?: UserRole | UserRole[]
): React.ComponentType<T> {
  return function ProtectedComponent(props: T): React.ReactElement | null {
    const { loading, hasAccess } = useAuthGuard(
      requiredPermission,
      requiredRole
    );

    if (loading) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement('div', {
          className:
            'animate-spin rounded-full h-8 w-8 border-b-2 border-primary',
        })
      );
    }

    if (!hasAccess) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement(
            'h2',
            { className: 'text-xl font-semibold text-negative mb-2' },
            'Access Denied'
          ),
          React.createElement(
            'p',
            { className: 'text-inactive' },
            'Redirecting...'
          )
        )
      );
    }

    return React.createElement(Component, props);
  };
}

export { AuthGuard };
