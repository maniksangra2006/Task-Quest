import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface ProgressChartProps {
  tasks: any[];
}

const ProgressChart = ({ tasks }: ProgressChartProps) => {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTasks = tasks.filter((task) => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return format(completedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });

    return {
      name: format(date, "EEE"),
      completed: dayTasks.length,
      points: dayTasks.reduce((sum, t) => sum + (t.points || 0), 0),
    };
  });

  // Generate current week data
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekData = weekDays.map((date) => {
    const dayTasks = tasks.filter((task) => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return format(completedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });

    return {
      name: format(date, "EEE"),
      completed: dayTasks.length,
      points: dayTasks.reduce((sum, t) => sum + (t.points || 0), 0),
    };
  });

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Progress Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <TabsList className="mb-4">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="week">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="7days">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
