import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: number;
  type: string;
  user: string;
  date: string;
}

interface ApprovalTimelineProps {
  events: Event[]
}

export function ApprovalTimeline({ events }: ApprovalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "viewed":
        return <Eye className="text-blue-500 h-4 w-4" />
      case "approved":
        return <CheckCircle className="text-green-500 h-4 w-4" />
      case "denied":
        return <XCircle className="text-red-500 h-4 w-4" />
      default:
        return null
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "viewed":
        return "bg-white border border-blue-500 text-white"
      case "approved":
        return "bg-white border border-green-500 text-white"
      case "denied":
        return "bg-white border border-red-500 text-white"
      default:
        return "bg-white border border-gray-500 text-white"
    }
  }

  return (
    <Card className="overflow-hidden border border-gray-200 h-full font-dm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Approval Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-16rem)]">
          <div className="relative pt-4 pr-4">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
            {events.map((event) => (
              <div key={event.id} className="relative mb-4 flex items-start">
                <div
                  className={cn(
                    "absolute left-4 flex items-center justify-center w-8 h-8 rounded-full -translate-x-1/2 z-10",
                    getEventColor(event.type),
                  )}
                >
                  {getEventIcon(event.type)}
                </div>
                <div className="ml-12">
                  <p className="font-medium">
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)} by {event.user}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

