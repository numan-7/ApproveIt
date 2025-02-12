'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

export function usePendingApprovals(runUseEffect = true) {
  const { user, loading: authLoading } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true ? runUseEffect : false);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals/incoming');
      const data = await res.json();
      if (res.ok) {
        setApprovals(data);
      } else {
        console.error('Error fetching pending approvals:', data.error);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && runUseEffect) {
      fetchApprovals();
    }
  }, [authLoading, user]);

  const updateApproval = (id: number, updated: Approval) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const approveApproval = async (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(
        idArr.map((id) =>
          fetch(`/api/approvals/incoming/${id}/approve`, { method: 'PATCH' })
        )
      );
      fetchApprovals();
    } catch (error) {
      console.error(error);
    }
  };

  const viewedApproval = async (approvalID: number) => {
    try {
      await fetch(`/api/approvals/incoming/${approvalID}/event`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const denyApproval = async (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(
        idArr.map((id) =>
          fetch(`/api/approvals/incoming/${id}/deny`, { method: 'PATCH' })
        )
      );
      fetchApprovals();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    approvals,
    loading,
    updateApproval,
    approveApproval,
    denyApproval,
    refresh: fetchApprovals,
    viewedApproval,
  };
}
