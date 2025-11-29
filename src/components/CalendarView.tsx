import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";

interface CalendarViewProps {
  tasks: any[];
}

const CalendarView = ({ tasks }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      return isSameDay(taskDate, date);
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Calendar View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[150px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const completedTasks = dayTasks.filter((t) => t.completed).length;
            const totalTasks = dayTasks.length;

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 rounded-lg border ${
                  isCurrentDay
                    ? "border-primary bg-primary/10 shadow-glow-primary"
                    : isCurrentMonth
                    ? "border-border bg-secondary/30"
                    : "border-border/30 bg-muted/20 opacity-50"
                }`}
              >
                <div className="text-sm font-semibold mb-1">{format(day, "d")}</div>
                
                {totalTasks > 0 && (
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.completed
                            ? "bg-success/20 text-success-foreground line-through"
                            : task.priority === "urgent"
                            ? "bg-destructive/20 text-destructive-foreground"
                            : task.priority === "high"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-primary/20 text-primary-foreground"
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    
                    {totalTasks > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{totalTasks - 2} more
                      </Badge>
                    )}
                    
                    {completedTasks > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {completedTasks}/{totalTasks} done
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
