'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

export function useMyApprovals(runUseEffect=true) {
  const { user, loading: authLoading } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true ? runUseEffect : false);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals/outgoing');
      const data = await res.json();
      if (res.ok) {
        setApprovals(data);
      } else {
        console.error('Error fetching my approvals:', data.error);
      }
    } catch (error) {
      console.error('Error fetching my approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && runUseEffect) {
      fetchApprovals();
    }
  }, [authLoading, user]);

  const addApproval = async (approval: Partial<Approval>) => {
    try {
      const res = await fetch('/api/approvals/outgoing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval),
      });
      const data = await res.json();
      if (res.ok) {
        setApprovals((prev) => [...prev, data[0]]);
      } else {
        throw new Error(data.error || 'Failed to create approval');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateApproval = async (
    id: number | string,
    updated: Partial<Approval>
  ) => {
    try {
      const res = await fetch(`/api/approvals/outgoing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedApproval = data.updatedApproval;
        setApprovals((prev) =>
          prev.map((a) => (a.id === id ? updatedApproval : a))
        );
      } else {
        throw new Error(data.error || 'Failed to update approval');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteApproval = async (ids: number[] | number) => {
    const idArr = Array.isArray(ids) ? ids : [ids];
    try {
      await Promise.all(
        idArr.map((id) =>
          fetch(`/api/approvals/outgoing/${id}`, {
            method: 'DELETE',
          })
        )
      );
      setApprovals((prev) => prev.filter((a) => !idArr.includes(a.id)));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    approvals,
    loading,
    addApproval,
    updateApproval,
    deleteApproval,
    refresh: fetchApprovals,
  };
}
