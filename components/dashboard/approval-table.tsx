'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pencil,
  Check,
  X,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  CalendarClock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';
import { convertToLocalTime } from '@/utils/date';
import { toast } from 'react-toastify';
import { SpinnerLoader } from '../ui/spinner-loader';
import { Suspense } from 'react';

interface ApprovalTableProps {
  approvals: Approval[];
  currentPage: number;
  itemsPerPage: number;
  type: 'incoming' | 'outgoing';
  onApprove?: (ids: number[] | number) => void;
  onDeny?: (ids: number[] | number) => void;
  onDelete?: (ids: number[] | number) => void;
}

type ExpiredFilterState = 'not_expired' | 'expired' | 'all';

export function ApprovalTable({
  approvals,
  currentPage,
  itemsPerPage,
  type,
  onApprove,
  onDeny,
  onDelete,
}: ApprovalTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [expiredFilter, setExpiredFilter] =
    useState<ExpiredFilterState>('not_expired');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSortField = searchParams.get('sortField') || 'date';
  const initialSortDirection = searchParams.get('sortDirection') || 'asc';
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const { user } = useAuth();

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch = approval.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === '' || approval.status === statusFilter;

    let matchesExpired: boolean;
    if (expiredFilter === 'not_expired') {
      matchesExpired = approval.expired === false;
    } else if (expiredFilter === 'expired') {
      matchesExpired = approval.expired === true;
    } else {
      matchesExpired = true;
    }

    return matchesSearch && matchesStatus && matchesExpired;
  });

  // Sorting logic (remains the same)
  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    let aValue: any = a[sortField as keyof Approval];
    let bValue: any = b[sortField as keyof Approval];

    if (sortField === 'approvers') {
      aValue = a.approvers.length;
      bValue = b.approvers.length;
    }
    if (sortField === 'date' || sortField === 'due_date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
      return sortDirection === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? aValue === bValue
          ? 0
          : aValue
            ? -1
            : 1
        : aValue === bValue
          ? 0
          : aValue
            ? 1
            : -1;
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedApprovals = sortedApprovals.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    const newSortDirection =
      field === sortField ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortField(field);
    setSortDirection(newSortDirection);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('sortField', field);
    currentParams.set('sortDirection', newSortDirection);
    router.push(`?${currentParams.toString()}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newIds = displayedApprovals.map((a) => a.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...newIds])));
    } else {
      setSelectedIds(
        selectedIds.filter((id) => !displayedApprovals.some((a) => a.id === id))
      );
    }
  };

  const handleEdit = () => {
    if (selectedIds.length === 1) {
      const approvalToEdit = approvals.find((a) => a.id === selectedIds[0]);
      const userEmail = user?.email;
      if (approvalToEdit && approvalToEdit.requester === userEmail) {
        router.push(`/dashboard/approvals/create?edit=${approvalToEdit.id}`);
      } else {
        toast.info('Only the requester can edit an outgoing approval.');
        console.log('Approval not editable by current user or not found.');
      }
    }
  };

  const handleAction = (action: 'approve' | 'deny' | 'delete') => {
    if (selectedIds.length === 0) return;

    let confirmMessage = '';
    const count = selectedIds.length;
    const plural = count > 1 ? 's' : '';

    if (action === 'delete') {
      confirmMessage = `Are you sure you want to delete ${count} selected approval${plural}?`;
    } else if (action === 'approve') {
      confirmMessage = `Are you sure you want to approve ${count} selected approval${plural}?`;
    } else if (action === 'deny') {
      confirmMessage = `Are you sure you want to deny ${count} selected approval${plural}?`;
    }

    if (confirm(confirmMessage)) {
      let actionSuccessful = false;
      try {
        if (action === 'approve' && onApprove) {
          onApprove(selectedIds);
          actionSuccessful = true;
        } else if (action === 'deny' && onDeny) {
          onDeny(selectedIds);
          actionSuccessful = true;
        } else if (action === 'delete' && onDelete) {
          onDelete(selectedIds);
          actionSuccessful = true;
        } else {
          console.warn(`Handler for action "${action}" is not provided.`);
          toast.warn(`Action "${action}" could not be performed.`);
        }

        if (actionSuccessful) {
          toast.success(`Successfully ${action}d ${count} approval${plural}.`);
          setSelectedIds([]);
          router.refresh();
        }
      } catch (err) {
        console.error(`Error during action ${action}:`, err);
        toast.error(
          `An error occurred while trying to ${action} the approval${plural}. Please try again.`
        );
      }
    }
  };

  const getUserApprovalStatus = () => {
    let canApprove = true;
    let canDeny = true;

    if (selectedIds.length === 0) {
      return { canApprove: false, canDeny: false };
    }

    selectedIds.forEach((id) => {
      const approval = approvals.find((a) => a.id === id);
      // If any selected approval is missing, expired, or user is not an approver, disable actions
      if (!approval || approval.expired) {
        canApprove = false;
        canDeny = false;
        return; // No need to check further for this ID if expired or missing
      }

      const approver = approval.approvers.find(
        // @ts-ignore
        (ap: { email: string; didApprove: boolean | null }) =>
          ap.email.toLowerCase() === user?.email?.toLowerCase()
      );

      // If user is not listed as an approver for *any* selected item, disable actions
      if (!approver) {
        canApprove = false;
        canDeny = false;
        return;
      }

      // If user has already approved any selected item, disable Approve button
      // @ts-ignore
      if (approver.didApprove === true) {
        canApprove = false;
      }
      // If user has already denied any selected item (didApprove is false), disable Deny button
      // @ts-ignore
      else if (approver.didApprove === false) {
        canDeny = false;
      }
    });

    return { canApprove, canDeny };
  };

  const { canApprove, canDeny } = getUserApprovalStatus();

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <div>
        <div className="flex flex-col md:flex-row justify-start items-center gap-2 mb-4 flex-wrap">
          {' '}
          {/* Search Input */}
          <div className="relative w-full md:w-auto md:flex-grow lg:flex-grow-0 lg:w-72">
            {' '}
            {/* Adjusted width */}
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Approvals By Name..."
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {/* Status Filter */}
          <div className="relative inline-block w-full md:w-auto">
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-1 text-sm pl-8 pr-6 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500" // Added focus style
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />{' '}
          </div>
          <div className="relative inline-block w-full md:w-auto">
            <CalendarClock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />{' '}
            <select
              value={expiredFilter}
              onChange={(e) =>
                setExpiredFilter(e.target.value as ExpiredFilterState)
              }
              className="border border-gray-300 rounded-md py-1 text-sm pl-8 pr-6 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500" // Added focus style
            >
              <option value="not_expired">Not Expired</option>
              <option value="expired">Expired Only</option>
              <option value="all">Show All (Incl. Expired)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />{' '}
          </div>
          <div className="w-full md:w-auto md:ml-auto">
            {' '}
            <div
              className={`flex items-center space-x-2 justify-start md:justify-end ${
                selectedIds.length > 0 ? 'visible' : 'invisible'
              }`}
            >
              {/* Edit Button */}
              {type === 'outgoing' && selectedIds.length === 1 && (
                <Button
                  onClick={handleEdit}
                  size="sm"
                  variant="outline"
                  className="py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1 hover:bg-gray-100" // Adjusted style
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {/* Approve/Deny Buttons */}
              {type === 'incoming' && selectedIds.length > 0 && (
                <>
                  <Button
                    onClick={() => handleAction('approve')}
                    size="sm"
                    variant="outline"
                    className="py-1 px-2 text-sm border border-emerald-600 rounded-md flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed" // Adjusted style
                    disabled={!canApprove}
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction('deny')}
                    size="sm"
                    variant="outline"
                    className="py-1 px-2 text-sm border border-red-600 rounded-md flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-800 disabled:opacity-50 disabled:cursor-not-allowed" // Adjusted style
                    disabled={!canDeny}
                  >
                    <X className="w-4 h-4" />
                    Deny
                  </Button>
                </>
              )}
              {/* Delete Button */}
              {type === 'outgoing' && selectedIds.length > 0 && (
                <Button
                  onClick={() => handleAction('delete')}
                  size="sm"
                  variant="destructive"
                  className="py-1 px-2 text-sm rounded-md flex items-center gap-1 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-md">
          {' '}
          <Table className="min-w-full divide-y divide-gray-200">
            {' '}
            <TableHeader className="bg-gray-50">
              {' '}
              <TableRow>
                <TableHead className="px-3 py-2 w-10">
                  {' '}
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      displayedApprovals.length > 0 && // Only check if there are items to check
                      displayedApprovals.every((a) =>
                        selectedIds.includes(a.id)
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                    aria-label="Select all items on this page"
                  />
                </TableHead>
                {/* Name */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Name</span>
                    {sortField === 'name' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Requester */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  <button
                    onClick={() => handleSort('requester')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Requester</span>
                    {sortField === 'requester' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Description */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  {' '}
                  {/* Adjusted width */}
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Description</span>
                    {sortField === 'description' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Approvers # */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  {' '}
                  <button
                    onClick={() => handleSort('approvers')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span># Appr</span>
                    {sortField === 'approvers' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Created */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  {' '}
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Created</span>
                    {sortField === 'date' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Due By */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  {' '}
                  <button
                    onClick={() => handleSort('due_date')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Due By</span>
                    {sortField === 'due_date' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Priority */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                  {' '}
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Priority</span>
                    {sortField === 'priority' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Expired */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  {' '}
                  <button
                    onClick={() => handleSort('expired')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Expired</span>
                    {sortField === 'expired' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
                {/* Status */}
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                  {' '}
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    {sortField === 'status' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {displayedApprovals.length > 0 ? (
                displayedApprovals.map((approval) => (
                  <TableRow key={approval.id} className="hover:bg-gray-50">
                    {' '}
                    <TableCell className="px-3 py-1 whitespace-nowrap">
                      {' '}
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(approval.id)}
                        onChange={() => toggleSelectOne(approval.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                        aria-labelledby={`approval-name-${approval.id}`}
                      />
                    </TableCell>
                    {/* Name */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      {' '}
                      <Link
                        id={`approval-name-${approval.id}`}
                        href={`/dashboard/approval/${approval.id}?type=${btoa(
                          (approval.requester === user?.email
                            ? 'outgoing'
                            : 'incoming') +
                            ' ' +
                            (user?.email ?? '')
                        )}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        title={approval.name}
                      >
                        {approval.name}
                      </Link>
                    </TableCell>
                    {/* Requester */}
                    <TableCell
                      className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate"
                      title={approval.requester}
                    >
                      {' '}
                      {approval.requester}
                    </TableCell>
                    {/* Description */}
                    <TableCell
                      className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 max-w-[250px] truncate"
                      title={approval.description}
                    >
                      {' '}
                      {/* Adjusted styles */}
                      {approval.description}
                    </TableCell>
                    {/* Approvers # */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 text-center">
                      {' '}
                      {approval.approvers.length}
                    </TableCell>
                    {/* Created */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {' '}
                      {/* Adjusted styles */}
                      {new Date(approval.date).toLocaleDateString()}
                    </TableCell>
                    {/* Due By */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {' '}
                      {approval.due_date
                        ? new Date(approval.due_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    {/* Priority */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm">
                      {' '}
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(approval.priority)}`} // Adjusted badge styles
                      >
                        {approval.priority}
                      </Badge>
                    </TableCell>
                    {/* Expired */}
                    <TableCell
                      className={`px-3 py-1 whitespace-nowrap text-sm ${approval.expired ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                    >
                      {' '}
                      {approval.expired ? 'Yes' : 'No'}
                    </TableCell>
                    {/* Status */}
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {' '}
                      {approval.status}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="px-3 py-4 text-center text-sm text-gray-500"
                  >
                    No approvals found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Suspense>
  );
}
