import React from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ban, Check, X, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"  
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
          <TableHead className="w-1/6">Quick Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayedApprovals.map((approval) => (
          <TableRow key={approval.id} className="py-0">
            <TableCell className="truncate max-w-[150px] py-0">
              <Link
                href={`/dashboard/approval/${approval.id}`}
                className="text-blue-600 hover:underline"
              >
                {approval.name}
              </Link>
            </TableCell>
            <TableCell className="truncate max-w-[150px] py-1">{approval.requester}</TableCell>
            <TableCell className="truncate max-w-[150px] py-0">{approval.approver}</TableCell>
            <TableCell className="truncate max-w-[150px] py-0">{approval.date}</TableCell>
            <TableCell className="py-0">
              <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                {approval.priority}
              </Badge>
            </TableCell>
            <TableCell className="truncate max-w-[150px] py-0">
              {approval.requester === "You" ? (
                <div className="flex items-center space-x-2">
                    <Badge
                      className="cursor-pointer  text-white px-2 py-0.5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Badge>
                    <Badge
                      className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-2 py-0.5"
                    >
                      <X className="w-4 h-4" />
                    </Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge
                    className="cursor-pointer bg-emerald-800 hover:bg-emerald-700 text-white px-2 py-0.5"
                  >
                    <Check className="w-4 h-4" />
                  </Badge>
                  <Badge
                    className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-2 py-0.5"
                  >
                    <X className="w-4 h-4" />
                  </Badge>
              </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
