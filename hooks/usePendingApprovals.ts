'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

export function usePendingApprovals() {
  const { user, loading: authLoading } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch your incoming (pending) approvals from the API.
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
    if (!authLoading && user) {
      fetchApprovals();
    }
  }, [authLoading, user]);

  // A simple state update helper for a single approval.
  const updateApproval = (id: number, updated: Approval) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  // Approve one or more approvals via the API.
  const approveApproval = async (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(
        idArr.map((id) =>
          fetch(`/api/approvals/incoming/${id}/approve`, { method: 'PATCH' })
        )
      );
      // After the action, refresh the pending approvals.
      fetchApprovals();
    } catch (error) {
      console.error(error);
    }
  };

  // Deny one or more approvals via the API.
  const denyApproval = async (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(
        idArr.map((id) =>
          fetch(`/api/approvals/incoming/${id}/deny`, { method: 'PATCH' })
        )
      );
      // After the action, refresh the pending approvals.
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
  };
}
