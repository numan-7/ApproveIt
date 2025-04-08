'use client';

import React, { useState, Suspense, useMemo } from 'react';
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
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Approval } from '@/types/approval';
import { toast } from 'react-toastify';
import { SpinnerLoader } from '../ui/spinner-loader';
import { useMyEmbeddings } from '@/hooks/useMyEmbeddings';
import BeatLoader from 'react-spinners/BeatLoader';

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
  const [statusFilter, setStatusFilter] = useState('');
  const [expiredFilter, setExpiredFilter] =
    useState<ExpiredFilterState>('not_expired');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [naturalLanguageSearch, setNaturalLanguageSearch] = useState('');
  const [embeddingSearchResults, setEmbeddingSearchResults] = useState<
    Approval[] | null
  >(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSortField = searchParams.get('sortField') || 'date';
  const initialSortDirection = searchParams.get('sortDirection') || 'asc';
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const { fetchEmbeddings, loading } = useMyEmbeddings();
  const { user } = useAuth();

  const baseList = useMemo(() => {
    const listToFilter = embeddingSearchResults ?? approvals;

    const filtered = listToFilter.filter((approval) => {
      const matchesSearch =
        embeddingSearchResults !== null
          ? true
          : approval.name.toLowerCase().includes(search.toLowerCase());

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

    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField as keyof Approval];
      let bValue: any = b[sortField as keyof Approval];

      if (sortField === 'approvers') {
        aValue = a.approvers.length;
        bValue = b.approvers.length;
      }
      if (sortField === 'date' || sortField === 'due_date') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
        if (!aValue) return sortDirection === 'asc' ? 1 : -1;
        if (!bValue) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
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
  }, [
    embeddingSearchResults,
    approvals,
    search,
    statusFilter,
    expiredFilter,
    sortField,
    sortDirection,
  ]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedApprovals = baseList.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    const newSortDirection =
      field === sortField ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortField(field);
    setSortDirection(newSortDirection);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('sortField', field);
    currentParams.set('sortDirection', newSortDirection);
    router.replace(`?${currentParams.toString()}`, { scroll: false });
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
          toast.warn(`Action "${action}" could not be performed.`);
        }

        if (actionSuccessful) {
          toast.success(`Successfully ${action}d ${count} approval${plural}.`);
          setSelectedIds([]);
          if (embeddingSearchResults) {
            setEmbeddingSearchResults(
              embeddingSearchResults.filter((a) => !selectedIds.includes(a.id))
            );
          }
        }
      } catch (err) {
        console.error(`Error during action ${action}:`, err);
        toast.error(
          `An error occurred while trying to ${action} the approval${plural}. Please try again.`
        );
      }
    }
  };

  const handleNaturalLanguageSearch = async () => {
    const query = naturalLanguageSearch.trim();
    if (!query) {
      toast.info('Please enter a query to search.');
      return;
    }

    try {
      toast.info(`Processing query: "${query}"...`);

      if (!approvals.length) {
        toast.error('No approvals found to process the query.');
        return;
      }

      let type = 'incoming';
      if (
        approvals.length > 0 &&
        approvals.some((a) => a.requester === user?.email)
      ) {
        type = 'outgoing';
      }

      const payload = { query: query, type: type };
      const results = await fetchEmbeddings(payload);

      if (!results || results.length === 0) {
        setEmbeddingSearchResults([]);
        toast.success('No matching approvals found for your query.');
        return;
      }

      const matchedIds = new Set(results.map((r: { id: number }) => r.id));
      const matchedApprovals = approvals
        .filter((approval) => matchedIds.has(approval.id))
        .map((approval) => {
          const match = results.find(
            (r: { id: number }) => r.id === approval.id
          );
          return {
            ...approval,
            similarity_score: match?.similarity_score ?? 0,
          };
        })
        .sort((a, b) => b.similarity_score - a.similarity_score);

      setEmbeddingSearchResults(matchedApprovals);
      toast.success('Query processed successfully.');
    } catch (error) {
      toast.error('Failed to process natural language query.');
      setEmbeddingSearchResults(null);
    }
  };

  const handleResetNaturalLanguageSearch = () => {
    setNaturalLanguageSearch('');
    setEmbeddingSearchResults(null);
    setSelectedIds([]);
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

  const getUserApprovalStatus = () => {
    let canApprove = true;
    let canDeny = true;

    if (selectedIds.length === 0) {
      return { canApprove: false, canDeny: false };
    }

    selectedIds.forEach((id) => {
      const approval = baseList.find((a) => a.id === id);
      if (!approval || approval.expired || approval.status !== 'pending') {
        canApprove = false;
        canDeny = false;
        return;
      }

      const approver = approval.approvers.find(
        (ap: { email: string; didApprove: boolean | null }) =>
          ap.email.toLowerCase() === user?.email?.toLowerCase()
      );

      if (!approver) {
        canApprove = false;
        canDeny = false;
        return;
      }

      if (approver.didApprove === true) {
        canApprove = false;
      } else if (approver.didApprove === false) {
        canDeny = false;
      }
    });

    return { canApprove, canDeny };
  };

  const { canApprove, canDeny } = getUserApprovalStatus();

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <div>
        <div className="flex items-center mb-2">
          <div className="relative flex-grow">
            <Sparkles
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={naturalLanguageSearch}
              onChange={(e) => setNaturalLanguageSearch(e.target.value)}
              placeholder="Ask about approvals (e.g., 'vaccinate the cat...')"
              className={`pl-8 pr-2 py-1 h-8 border border-gray-300 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-l-md rounded-r-none`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNaturalLanguageSearch();
                }
              }}
            />
          </div>
          <Button
            onClick={handleNaturalLanguageSearch}
            size="sm"
            variant="outline"
            disabled={loading}
            className={`px-3 border-gray-300 min-w-24 ${
              embeddingSearchResults !== null
                ? 'rounded-none border-l-0'
                : 'rounded-l-none border-l-0 rounded-r-md'
            }`}
          >
            {loading ? <BeatLoader size={10} /> : 'Search'}
          </Button>
          {embeddingSearchResults !== null && (
            <Button
              onClick={handleResetNaturalLanguageSearch}
              size="sm"
              variant="outline"
              className="px-2 py-1 border-gray-300 border-l-0 rounded-l-none rounded-r-md text-gray-600 hover:text-gray-800"
              title="Reset Search"
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-start items-center gap-2 mb-2 flex-wrap">
          <div className="relative w-full md:w-auto md:flex-grow lg:flex-grow-0 lg:w-72">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Name..."
              className="pl-8 pr-2 py-1 h-8 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={embeddingSearchResults !== null}
            />
          </div>
          <div className="relative inline-block w-full md:w-auto">
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-1 h-8 text-sm pl-8 pr-6 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <div className="relative inline-block w-full md:w-auto">
            <CalendarClock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={expiredFilter}
              onChange={(e) =>
                setExpiredFilter(e.target.value as ExpiredFilterState)
              }
              className="border border-gray-300 rounded-md py-1 h-8 text-sm pl-8 pr-6 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="not_expired">Not Expired</option>
              <option value="expired">Expired Only</option>
              <option value="all">Show All (Incl. Expired)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <div className="w-full md:w-auto md:ml-auto">
            <div
              className={`flex items-center space-x-2 justify-start md:justify-end ${
                selectedIds.length > 0 ? 'visible' : 'invisible'
              }`}
            >
              {type === 'outgoing' && selectedIds.length === 1 && (
                <Button
                  onClick={handleEdit}
                  size="sm"
                  variant="outline"
                  className="py-1 px-2 text-sm"
                  disabled={
                    !approvals.find(
                      (a) =>
                        a.id === selectedIds[0] && a.requester === user?.email
                    )
                  }
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              {type === 'incoming' && selectedIds.length > 0 && (
                <>
                  <Button
                    onClick={() => handleAction('approve')}
                    size="sm"
                    variant="outline"
                    className="py-1 px-2 text-sm border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canApprove}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction('deny')}
                    size="sm"
                    variant="outline"
                    className="py-1 px-2 text-sm border-red-600 bg-red-50 hover:bg-red-100 text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canDeny}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Deny
                  </Button>
                </>
              )}
              {type === 'outgoing' && selectedIds.length > 0 && (
                <Button
                  onClick={() => handleAction('delete')}
                  size="sm"
                  variant="destructive"
                  className="py-1 px-2 text-sm disabled:opacity-50"
                  disabled={selectedIds.some(
                    (id) =>
                      !approvals.find(
                        (a) => a.id === id && a.requester === user?.email
                      )
                  )}
                >
                  <X className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md shadow-sm">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      displayedApprovals.length > 0 &&
                      displayedApprovals.every((a) =>
                        selectedIds.includes(a.id)
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-blue-500"
                    aria-label="Select all items on this page"
                  />
                </TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  <button
                    onClick={() => handleSort('requester')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  <button
                    onClick={() => handleSort('approvers')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  <button
                    onClick={() => handleSort('due_date')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  <button
                    onClick={() => handleSort('expired')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700 focus:outline-none"
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
                  <TableRow
                    key={approval.id}
                    className="hover:bg-gray-50"
                    data-state={
                      selectedIds.includes(approval.id) ? 'selected' : undefined
                    }
                  >
                    <TableCell className="px-3 py-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(approval.id)}
                        onChange={() => toggleSelectOne(approval.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-blue-500"
                        aria-labelledby={`approval-name-${approval.id}`}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[200px] truncate">
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
                    <TableCell
                      className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate"
                      title={approval.requester}
                    >
                      {approval.requester}
                    </TableCell>
                    <TableCell
                      className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 max-w-[250px] truncate"
                      title={approval.description}
                    >
                      {approval.description}
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 text-center">
                      {approval.approvers.length}
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {new Date(approval.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {approval.due_date
                        ? new Date(approval.due_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(approval.priority)}`}
                      >
                        {approval.priority}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`px-3 py-1 whitespace-nowrap text-sm ${approval.expired ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                    >
                      {approval.expired ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="px-3 py-1 whitespace-nowrap text-sm text-gray-500 capitalize">
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
