import React from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Approval } from "@/types/approval"

interface ApprovalTableProps {
  approvals: Approval[]
  currentPage: number
  itemsPerPage: number
}

export function ApprovalTable({ approvals, currentPage, itemsPerPage }: ApprovalTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedApprovals = approvals.slice(startIndex, endIndex)

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

  return (
    <Table className="w-full mx-auto">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Name</TableHead>
          <TableHead className="w-1/6">Requester</TableHead>
          <TableHead className="w-1/6">Approver</TableHead>
          <TableHead className="w-1/6">Date</TableHead>
          <TableHead className="w-1/12">Priority</TableHead>
          <TableHead className="w-1/12">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayedApprovals.map((approval) => (
          <TableRow key={approval.id}>
            <TableCell className="truncate max-w-[150px]">
              <Link href={`/dashboard/approval/${approval.id}`} className="text-blue-600 hover:underline">
                {approval.name}
              </Link>
            </TableCell>
            <TableCell className="truncate max-w-[150px]">{approval.requester}</TableCell>
            <TableCell className="truncate max-w-[150px]">{approval.approver}</TableCell>
            <TableCell className="truncate max-w-[150px]">{approval.date}</TableCell>
            <TableCell>
              <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="truncate max-w-[150px]">{approval.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

