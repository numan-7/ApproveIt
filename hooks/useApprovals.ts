'use client';

import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';

interface OperationResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useApprovals() {
  const { user } = useAuth();

  const getKey = (): string =>
    user ? `approvals_${user.email}` : 'approvals_default';

  const getAllApprovals = async (): Promise<OperationResult<Approval[]>> => {
    try {
      const key = getKey();
      const stored = localStorage.getItem(key);
      const approvals: Approval[] = stored ? JSON.parse(stored) : [];
      return { data: approvals, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const getAllUserApprovals = async (): Promise<
    OperationResult<Approval[]>
  > => {
    try {
      if (!user) throw new Error('No user available');
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const data =
        result.data?.filter(
          (a) =>
            user?.email &&
            (a.requester === user.email || a.approvers.includes(user.email))
        ) || [];
      return { data, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const getAllOutgoingApprovals = async (): Promise<
    OperationResult<Approval[]>
  > => {
    try {
      if (!user) throw new Error('No user available');
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const data = result.data?.filter((a) => a.requester === user.email) || [];
      return { data, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const getApprovalById = async (
    id: number
  ): Promise<OperationResult<Approval>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const approval = result.data?.find((a) => a.id === id);
      if (!approval) throw new Error('Approval not found');
      return { data: approval, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const updateApprovalById = async (
    id: number,
    updatedApproval: Approval
  ): Promise<OperationResult<Approval[]>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const updated =
        result.data?.map((a) => (a.id === id ? updatedApproval : a)) || [];
      localStorage.setItem(getKey(), JSON.stringify(updated));
      return { data: updated, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const addApprovals = async (
    newApprovals: Approval | Approval[]
  ): Promise<OperationResult<Approval[]>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const approvalsToAdd = Array.isArray(newApprovals)
        ? newApprovals
        : [newApprovals];
      const updated = [...(result.data || []), ...approvalsToAdd];
      localStorage.setItem(getKey(), JSON.stringify(updated));
      return { data: updated, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const deleteApprovals = async (
    ids: number | number[]
  ): Promise<OperationResult<Approval[]>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const idArray = Array.isArray(ids) ? ids : [ids];
      const updated = (result.data || []).filter(
        (a) => !idArray.includes(a.id)
      );
      localStorage.setItem(getKey(), JSON.stringify(updated));
      return { data: updated, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const approveApprovals = async (
    ids: number | number[]
  ): Promise<OperationResult<Approval[]>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const idArray = Array.isArray(ids) ? ids : [ids];
      const updated = (result.data || []).map((a) =>
        idArray.includes(a.id) ? { ...a, status: 'approved' as 'approved' } : a
      );
      localStorage.setItem(getKey(), JSON.stringify(updated));
      return { data: updated, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  const denyApprovals = async (
    ids: number | number[]
  ): Promise<OperationResult<Approval[]>> => {
    try {
      const result = await getAllApprovals();
      if (result.error) throw result.error;
      const idArray = Array.isArray(ids) ? ids : [ids];
      const updated = (result.data || []).map((a) =>
        idArray.includes(a.id) ? { ...a, status: 'rejected' as 'rejected' } : a
      );
      localStorage.setItem(getKey(), JSON.stringify(updated));
      return { data: updated, error: null, loading: false };
    } catch (error: any) {
      return { data: null, error, loading: false };
    }
  };

  return {
    getAllUserApprovals,
    getAllOutgoingApprovals,
    getApprovalById,
    updateApprovalById,
    addApprovals,
    deleteApprovals,
    approveApprovals,
    denyApprovals,
  };
}
