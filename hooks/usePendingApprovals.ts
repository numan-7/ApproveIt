'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';
import { DataApprovals } from '@/data/pending-approvals';

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
        // If nothing is stored yet, initialize with the default DataApprovals.
        setApprovals(DataApprovals);
      }
      setLoading(false);
    }
  }, [authLoading, user, key]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(key, JSON.stringify(approvals));
    }
  }, [approvals, key, loading]);

  const updateApproval = (id: number, updated: Approval) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const approveApproval = (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    setApprovals((prev) =>
      prev.map((a) => {
        if (idArr.includes(a.id)) {
          const currentUserEmail = user?.email;
          if (!currentUserEmail) return a;
          const newApprovers = a.approvers.map((approver) =>
            approver.email === currentUserEmail
              ? { ...approver, didApprove: true }
              : approver
          );
          const allApproved = newApprovers.every((appr) => appr.didApprove);
          return {
            ...a,
            approvers: newApprovers,
            status: allApproved ? 'approved' : a.status,
          };
        }
        return a;
      })
    );
  };

  const denyApproval = (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    setApprovals((prev) =>
      prev.map((a) => {
        if (idArr.includes(a.id)) {
          const currentUserEmail = user?.email;
          if (!currentUserEmail) return a;
          const newApprovers = a.approvers.map((approver) =>
            approver.email === currentUserEmail
              ? { ...approver, didApprove: false }
              : approver
          );
          return { ...a, approvers: newApprovers, status: 'rejected' };
        }
        return a;
      })
    );
  };

  return {
    approvals,
    loading,
    updateApproval,
    approveApproval,
    denyApproval,
    setApprovals,
  };
}
