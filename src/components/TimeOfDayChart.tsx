import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";

interface TimeOfDayChartProps {
  tasks: any[];
}

const TimeOfDayChart = ({ tasks }: TimeOfDayChartProps) => {
  const completedTasks = tasks.filter((t) => t.completed && t.completed_at);

  // Group tasks by hour of completion
  const hourCounts = Array.from({ length: 24 }, (_, hour) => {
    const count = completedTasks.filter((task) => {
      const completedDate = new Date(task.completed_at);
      return completedDate.getHours() === hour;
    }).length;

    return {
      hour: hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`,
      count,
    };
  }).filter(item => item.count > 0);

  if (hourCounts.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activity by Time of Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No completed tasks yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-lg hover:shadow-glow-primary transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Activity by Time of Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourCounts}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: any) => [`${value} tasks`, "Completed"]}
            />
            <Bar dataKey="count" fill="hsl(var(--cyan))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimeOfDayChart;
