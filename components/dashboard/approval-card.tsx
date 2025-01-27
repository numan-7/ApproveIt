import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, MessageSquare, ChevronDown, ChevronUp, Paperclip, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Approval } from "@/app/types/approval"

interface ApprovalCardProps {
  approval: Approval
  isMyRequest: boolean
  onToggleExpand: () => void
}

export function ApprovalCard({ approval, isMyRequest, onToggleExpand }: ApprovalCardProps) {
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
    <Card className="overflow-hidden border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{approval.name}</CardTitle>
            <CardDescription className="mt-1">
              {isMyRequest ? `Approver: ${approval.approver}` : `Requester: ${approval.requester}`} • {approval.date}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(approval.priority)}>
              {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)} Priority
            </Badge>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              {approval.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("grid gap-6", !approval.expanded && "hidden") + " overflow-auto"}>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Description</h3>
          <p>{approval.description}</p>
        </div>

        <div>
          <h3 className="font-medium mb-3">Attachments</h3>
          <div className="grid gap-2">
            {approval.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Paperclip className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs">{file.size}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Comments</h3>
          <ScrollArea className="h-[240px] rounded-md border">
            <div className="p-4 grid gap-4">
              {approval.comments.map((comment, index) => (
                <div key={index} className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user}</span>
                      <span className="text-xs">{comment.date}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      <CardFooter>
        {!isMyRequest && (
          <>
            <Button variant="outline" className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

