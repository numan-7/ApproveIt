'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

const LOCAL_STORAGE_KEY_PREFIX = 'myApprovals_';

export function useMyApprovals() {
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
          console.error('Error parsing my approvals:', e);
          setApprovals([]);
        }
      } else {
        setApprovals([]);
      }
      setLoading(false);
    }
  }, [authLoading, user, key]);

  // Write changes to localStorage whenever approvals update.
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

  const deleteApproval = (ids: number[]) => {
    setApprovals((prev) => prev.filter((a) => !ids.includes(a.id)));
  };

  return {
    approvals,
    loading,
    addApproval,
    updateApproval,
    deleteApproval,
    setApprovals,
  };
}
