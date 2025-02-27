'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  VideoIcon,
  ClockAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Approval } from '@/types/approval';
import { useRouter } from 'next/navigation';
import { convertToLocalTime } from '@/utils/date';

interface UpcomingApprovalsCalendarProps {
  approvals: Approval[];
}

interface DayEvent {
  approval: Approval;
  isDue: boolean;
  isMeeting: boolean;
}

export function UpcomingApprovalsCalendar({
  approvals,
}: UpcomingApprovalsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getApprovalType(approval: Approval): 'incoming' | 'outgoing' {
    if (approval && approval.events) {
      return 'outgoing';
    }
    return 'incoming';
  }

  // This function checks both dates.
  // It returns an array of DayEvent objects for events that should appear on the given day
  // For Approvals that have Due Date and Zoom Meeting, it will appear twice
  const getEventsForDay = (day: number): DayEvent[] => {
    return approvals.reduce<DayEvent[]>((acc, approval) => {
      const dueDate = new Date(approval.due_date);
      const meetingDate =
        (approval.zoom_meeting &&
          approval.zoom_meeting.meeting_id &&
          approval.zoom_meeting.start_time) ||
        approval.zoom_meeting.meetingStartTime
          ? new Date(
              approval.zoom_meeting.meetingStartTime ||
                approval.zoom_meeting.start_time
            )
          : null;
      const isDue =
        dueDate.getDate() === day &&
        dueDate.getMonth() === currentDate.getMonth() &&
        dueDate.getFullYear() === currentDate.getFullYear();
      const isMeeting = meetingDate
        ? meetingDate.getDate() === day &&
          meetingDate.getMonth() === currentDate.getMonth() &&
          meetingDate.getFullYear() === currentDate.getFullYear()
        : false;
      if (isDue || isMeeting) {
        acc.push({ approval, isDue, isMeeting });
      }
      return acc;
    }, []);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const getBackgroundForStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100';
      case 'rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  // For the sidebar section, we want to show approvals due within a 2 week period
  const twoWeekFromNow = new Date();
  twoWeekFromNow.setDate(twoWeekFromNow.getDate() + 14);
  const approvalsWithinWeek = approvals
    .filter((approval) => {
      const dueDate = new Date(approval.due_date);
      return dueDate >= new Date() && dueDate <= twoWeekFromNow;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

  console.log(approvalsWithinWeek);

  return (
    <Card className="h-full max-h-[550px] font-dm overflow-y-scroll scrollbar scrollbar-hidden scrollbar-hover rounded-md">
      <CardContent className="p-0 h-full overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Calendar Section */}
          <div className="lg:w-2/3 p-5 flex flex-col h-full">
            <div className="flex flex-col flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-grow grid grid-cols-7 gap-px justify-items-center">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const eventsForDay = getEventsForDay(day);
                const dueCount = eventsForDay.filter((e) => e.isDue).length;
                const meetingCount = eventsForDay.filter(
                  (e) => e.isMeeting
                ).length;
                const hasItems = eventsForDay.length > 0;
                return (
                  <Popover key={day}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`p-0 h-9 w-9 ${
                          hasItems ? 'bg-blue-100 hover:bg-blue-200' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center relative">
                          <span className="text-sm">{day}</span>
                          <div className="absolute top-3 flex gap-1">
                            {dueCount > 0 && (
                              <span className="flex items-center text-[10px] text-blue-600">
                                D:{dueCount}
                              </span>
                            )}
                            {meetingCount > 0 && (
                              <span className="flex items-center text-[10px] text-blue-600">
                                M:{meetingCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    {hasItems && (
                      <PopoverContent className="w-[90vw] md:w-64 font-dm">
                        <h3 className="font-semibold mb-2">Events:</h3>
                        <ul className="list-none pl-0">
                          {eventsForDay.map(
                            ({ approval, isDue, isMeeting }) => {
                              const type = getApprovalType(approval);
                              return (
                                <li
                                  key={approval.id}
                                  className="text-sm mb-2 hover:bg-gray-100 bg-gray-50 p-1 rounded cursor-pointer"
                                  onClick={() => {
                                    router.push(
                                      `dashboard/approval/${approval.id}?type=${btoa(
                                        type + ' ' + approval.name
                                      )}`
                                    );
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                      {approval.name}
                                      {isMeeting && (
                                        <VideoIcon className="h-3 w-3 text-blue-500" />
                                      )}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`${getBackgroundForStatus(
                                        approval.status
                                      )}`}
                                    >
                                      {type === 'incoming' ? (
                                        <ArrowDownLeft className="h-3 w-3 mr-1" />
                                      ) : (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                      )}
                                      {type}
                                    </Badge>
                                  </div>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
            </div>
          </div>
          {/* Sidebar Sectionnnnnnn */}
          <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <CalendarDays className="h-5 w-5 text-red-950 mr-2" />
              <h3 className="font-semibold">Approvals Due Soon</h3>
            </div>
            <ScrollArea className="h-full">
              {approvalsWithinWeek.length > 0 ? (
                approvalsWithinWeek.map((approval) => {
                  const type = getApprovalType(approval);
                  return (
                    <div
                      key={approval.id}
                      className="mb-2 p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        router.push(
                          `dashboard/approval/${approval.id}?type=${btoa(type + ' ' + approval.name)}`
                        );
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{approval.name}</p>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <ClockAlert className="h-3 w-3" />
                            {convertToLocalTime(approval.due_date)}
                          </div>
                          {approval.zoom_meeting &&
                            approval.zoom_meeting.join_url && (
                              <div className="flex items-center gap-1 text-blue-500">
                                <VideoIcon className="h-3 w-3" />
                                <span className="text-xs ">
                                  {convertToLocalTime(
                                    approval.zoom_meeting.start_time ||
                                      approval.zoom_meeting.meetingStartTime
                                  )}
                                </span>
                              </div>
                            )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getBackgroundForStatus(
                            approval.status
                          )}`}
                        >
                          {type === 'incoming' ? (
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          )}
                          {type}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  No approvals due within a week
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
