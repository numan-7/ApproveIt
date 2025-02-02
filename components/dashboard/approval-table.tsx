"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ban, Check, X, Pencil, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Approval } from "@/types/approval"

interface ApprovalTableProps {
  approvals: Approval[]
  currentPage: number
  itemsPerPage: number
}

export function ApprovalTable({ approvals, currentPage, itemsPerPage }: ApprovalTableProps) {
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const pathname = usePathname()
  const isMyRequests = pathname.includes("/dashboard/approvals/my-requests")
  const isPendingApprovals = pathname.includes("/dashboard/approvals/pending")

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch = approval.name.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === "" || approval.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedApprovals = filteredApprovals.slice(startIndex, endIndex)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newIds = displayedApprovals.map((a) => a.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])))
    } else {
      setSelectedIds((prev) => prev.filter((id) => !displayedApprovals.some((a) => a.id === id)))
    }
  }

  const handleEdit = () => {
    console.log("god i dont wanna implemtn this editnig shit", selectedIds)
  }

  const handleDelete = () => {
    console.log("bye bye ", selectedIds)
  }

  const handleApprove = () => {
    console.log("approv ethis ho", selectedIds)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-start items-center gap-2 mb-4">
        <div className="relative w-full md:w-64">
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md py-1 text-sm pl-8 pr-2 appearance-none cursor-pointer hover:bg-gray-50 w-full md:w-auto"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="w-full md:min-w-[220px]">
          <div className={`flex items-center space-x-2 ${selectedIds.length > 0 ? "visible" : "invisible"}`}>
            {isMyRequests && selectedIds.length === 1 && (
              <Button
                onClick={handleEdit}
                size="sm"
                className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            {isPendingApprovals && selectedIds.length > 0 && (
              <Button
                onClick={handleApprove}
                size="sm"
                variant="outline"
                className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1 bg-emerald-800 hover:bg-emerald-700 text-white hover:text-white"
              >
                <Check className="w-4 h-4" />
                Approve
              </Button>
            )}
            <Button
              onClick={handleDelete}
              size="sm"
              variant="destructive"
              className="pl-8 shadow-none py-1 px-2 text-sm border border-gray-300 rounded-md flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full mx-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/12">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    displayedApprovals.length > 0 &&
                    displayedApprovals.every((a) => selectedIds.includes(a.id))
                  }
                />
              </TableHead>
              <TableHead className="w-1/4">Name</TableHead>
              <TableHead className="w-1/6">Requester</TableHead>
              <TableHead className="w-1/6">Approver</TableHead>
              <TableHead className="w-1/6">Date</TableHead>
              <TableHead className="w-1/12">Priority</TableHead>
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
                    href={`/dashboard/approval/${approval.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {approval.name}
                  </Link>
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-1">
                  {approval.requester}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {approval.approver}
                </TableCell>
                <TableCell className="truncate max-w-[150px] py-0">
                  {approval.date}
                </TableCell>
                <TableCell className="py-0">
                  <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                    {approval.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
