'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

const LOCAL_STORAGE_KEY_PREFIX = 'pendingApprovals_';

export function usePendingApprovals() {
  const { user, loading: authLoading } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const key = user
    ? `${LOCAL_STORAGE_KEY_PREFIX}${user.email}`
    : `${LOCAL_STORAGE_KEY_PREFIX}default`;

  useEffect(() => {
    if (!authLoading && user) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setApprovals(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing pending approvals:', e);
          setApprovals([]);
        }
      } else {
        setApprovals([]);
      }
      setLoading(false);
    }
  }, [authLoading, user, key]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(key, JSON.stringify(approvals));
    }
  }, [approvals, key, loading]);

  const addApproval = (approval: Approval) => {
    setApprovals((prev) => [...prev, approval]);
  };

  const updateApproval = (id: number, updated: Approval) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const approveApproval = (id: number) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    );
  };

  const denyApproval = (id: number) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    );
  };

  return {
    approvals,
    loading,
    addApproval,
    updateApproval,
    approveApproval,
    denyApproval,
    setApprovals,
  };
}
