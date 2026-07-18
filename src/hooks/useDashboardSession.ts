'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus?: string;
  phone?: string | null;
}

export function useDashboardSession() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return null;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        router.push('/login');
        return null;
      }

      const data = await response.json();
      setUser(data.user);
      return data.user as DashboardUser;
    } catch (error) {
      console.error('Error fetching user session:', error);
      router.push('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/login');
  };

  return {
    user,
    loading,
    handleLogout,
    refreshUser: fetchUser,
    userName: user ? `${user.firstName} ${user.lastName}` : undefined,
  };
}
