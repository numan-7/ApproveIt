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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';
import { convertToLocalTime } from '@/utils/date';
import { toast } from 'react-toastify';

interface ApprovalTableProps {
  approvals: Approval[];
  currentPage: number;
  itemsPerPage: number;
  type: 'incoming' | 'outgoing';
  onApprove?: (ids: number[] | number) => void;
  onDeny?: (ids: number[] | number) => void;
  onDelete?: (ids: number[] | number) => void;
}

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
    return matchesSearch && matchesStatus;
  });

  // Sorting logic: for fields like "date" and "due_date" convert to Date,
  // for "approvers" sort by the number of approvers.
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
    router.push(`?sortField=${field}&sortDirection=${newSortDirection}`);
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
        console.log('Approval not editable.');
      }
    }
  };

  const handleAction = (action: 'approve' | 'deny' | 'delete') => {
    if (selectedIds.length === 0) return;

    let confirmMessage = '';
    if (action === 'delete') {
      confirmMessage =
        'Are you sure you want to delete the selected approval(s)?';
    } else if (action === 'approve') {
      confirmMessage =
        'Are you sure you want to approve the selected approval(s)?';
    } else if (action === 'deny') {
      confirmMessage =
        'Are you sure you want to deny the selected approval(s)?';
    }

    if (confirm(confirmMessage)) {
      try {
        if (action === 'approve' && onApprove) {
          onApprove(selectedIds);
        } else if (action === 'deny' && onDeny) {
          onDeny(selectedIds);
        } else if (action === 'delete' && onDelete) {
          onDelete(selectedIds);
        }
      } catch (err) {
        toast.error('An error occurred with the server. Please try again.');
      } finally {
        toast.success('Action completed successfully.');
        setSelectedIds([]);
        router.refresh();
      }
    }
  };

  const getUserApprovalStatus = () => {
    let hasApproved = false;
    let hasDenied = false;

    selectedIds.forEach((id) => {
      const approval = approvals.find((a) => a.id === id);
      if (!approval || !approval.approvers) return;

      const approver = approval.approvers.find(
        // @ts-ignore
        (ap) => ap.email.toLowerCase() === user?.email.toLowerCase()
      );

      if (approver && approval.expired === false) {
        console.log('here');
        // @ts-ignore
        if (approver.didApprove === true) {
          hasApproved = true;
        } else {
          hasDenied = true;
        }
      } else {
        hasApproved = true;
        hasDenied = true;
      }
    });

    return { hasApproved, hasDenied };
  };

  const { hasApproved, hasDenied } = getUserApprovalStatus();

  console.log(hasApproved, hasDenied);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-start items-center gap-2 mb-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Approvals By Name..."
            className="pl-8 pr-2 py-1 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="relative inline-block w-full md:w-auto">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md py-1 text-sm pl-8 pr-2 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="w-full md:min-w-[220px]">
          <div
            className={`flex items-center space-x-2 ${
              selectedIds.length > 0 ? 'visible' : 'invisible'
            }`}
          >
            {type === 'outgoing' && selectedIds.length === 1 && (
              <Button
                onClick={handleEdit}
                size="sm"
                className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            {type === 'incoming' && selectedIds.length > 0 && (
              <>
                <Button
                  onClick={() => handleAction('approve')}
                  size="sm"
                  variant="outline"
                  className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1 bg-emerald-800 hover:bg-emerald-700 text-white hover:text-white"
                  disabled={hasApproved}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction('deny')}
                  size="sm"
                  variant="destructive"
                  className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1"
                  disabled={hasDenied}
                >
                  <X className="w-4 h-4" />
                  Deny
                </Button>
              </>
            )}
            {type === 'outgoing' && (
              <Button
                onClick={() => handleAction('delete')}
                size="sm"
                variant="destructive"
                className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full mx-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[calc(100%/24)]">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    displayedApprovals.length > 0 &&
                    displayedApprovals.every((a) => selectedIds.includes(a.id))
                  }
                />
              </TableHead>
              <TableHead className="w-1/6">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2"
                >
                  <span>Name</span>
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-1/6">
                <button
                  onClick={() => handleSort('requester')}
                  className="flex items-center gap-2"
                >
                  <span>Requester</span>
                  {sortField === 'requester' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-1/6">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center gap-2"
                >
                  <span>Description</span>
                  {sortField === 'description' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-[calc(100%/20)]">
                <button
                  onClick={() => handleSort('approvers')}
                  className="flex items-center gap-2"
                >
                  <span>Approvers #</span>
                  {sortField === 'approvers' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-[calc(100%/24)]">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2"
                >
                  <span>Created</span>
                  {sortField === 'date' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-1/12">
                <button
                  onClick={() => handleSort('due_date')}
                  className="flex items-center gap-2"
                >
                  <span>Due By</span>
                  {sortField === 'due_date' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-[calc(100%/24)]">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2"
                >
                  <span>Priority</span>
                  {sortField === 'priority' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-[calc(100%/24)]">
                <button
                  onClick={() => handleSort('expired')}
                  className="flex items-center gap-2"
                >
                  <span>Expired</span>
                  {sortField === 'expired' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
              <TableHead className="w-[calc(100%/24)]">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2"
                >
                  <span>Status</span>
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    ))}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedApprovals.map((approval) => (
              <TableRow key={approval.id} className="py-0">
                <TableCell className="py-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(approval.id)}
                    onChange={() => toggleSelectOne(approval.id)}
                  />
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  <Link
                    href={`/dashboard/approval/${approval.id}?type=${
                      approval.requester === user?.email
                        ? btoa('outgoing' + ' ' + user?.email)
                        : btoa('incoming' + ' ' + user?.email)
                    }`}
                    className="text-blue-600 hover:underline"
                  >
                    {approval.name}
                  </Link>
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-1">
                  {approval.requester}
                </TableCell>
                <TableCell className="max-w-[150px] truncate overflow-hidden whitespace-nowrap text-ellipsis py-0">
                  {approval.description}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {approval.approvers.length}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {convertToLocalTime(approval.date).slice(0, 9)}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {convertToLocalTime(approval.due_date)}
                </TableCell>
                <TableCell className="py-0">
                  <Badge
                    variant="outline"
                    className={getPriorityColor(approval.priority)}
                  >
                    {approval.priority}
                  </Badge>
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {approval.expired ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {approval.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
