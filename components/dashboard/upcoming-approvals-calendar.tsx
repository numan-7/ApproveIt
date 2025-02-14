'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Approval } from '@/types/approval';
import { useRouter } from 'next/navigation';

interface UpcomingApprovalsCalendarProps {
  approvals: Approval[];
}

export function UpcomingApprovalsCalendar({
  approvals,
}: UpcomingApprovalsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const router = useRouter();

  console.log(approvals);

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

  const getApprovalsForDay = (day: number) => {
    return approvals.filter((approval) => {
      const approvalDate = new Date(approval.due_date);
      return (
        approvalDate.getDate() === day &&
        approvalDate.getMonth() === currentDate.getMonth() &&
        approvalDate.getFullYear() === currentDate.getFullYear()
      );
    });
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

  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  const approvalsWithinWeek = approvals
    .filter((approval) => {
      const approvalDate = new Date(approval.due_date);
      return approvalDate >= new Date() && approvalDate <= oneWeekFromNow;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

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
            <div className="flex-grow grid grid-cols-7 gap-px justify-items-center bg-gray-">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayApprovals = getApprovalsForDay(day);
                return (
                  <Popover key={day}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`p-0 h-9 w-9 ${
                          dayApprovals.length > 0
                            ? 'bg-blue-100 hover:bg-blue-200'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{day}</span>
                          {dayApprovals.length > 0 && (
                            <span className="text-[10px] leading-none text-blue-600">
                              {dayApprovals.length}
                            </span>
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    {dayApprovals.length > 0 && (
                      <PopoverContent className="w-[90vw] md:w-64 font-dm">
                        <h3 className="font-semibold mb-2">Approvals Due:</h3>
                        <ul className="list-none pl-0">
                          {dayApprovals.map((approval) => {
                            const type = getApprovalType(approval);
                            return (
                              <li
                                key={approval.id}
                                className="text-sm mb-2 hover:bg-gray-100 bg-gray-50
                                p-1 rounded cursor-pointer"
                                onClick={() => {
                                  router.push(
                                    `dashboard/approval/${approval.id}?type=${btoa(type + ' ' + approval.name)}`
                                  );
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{approval.name}</span>
                                  <Badge
                                    variant={
                                      type === 'incoming'
                                        ? 'default'
                                        : 'outline'
                                    }
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
                          })}
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
                          <p className="text-xs text-gray-600">
                            {new Date(approval.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={type === 'incoming' ? 'default' : 'outline'}
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
