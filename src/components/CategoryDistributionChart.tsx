import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LayoutGrid } from "lucide-react";
import { TASK_CATEGORIES } from "@/lib/categories";

interface CategoryDistributionChartProps {
  tasks: any[];
}

const CategoryDistributionChart = ({ tasks }: CategoryDistributionChartProps) => {
  const completedTasks = tasks.filter((t) => t.completed);

  // Count tasks by category
  const categoryData = TASK_CATEGORIES.map((category) => {
    const count = completedTasks.filter((t) => t.category === category.id).length;
    return {
      name: category.name,
      value: count,
      color: `hsl(var(--${category.id === "work" || category.id === "projects" ? "primary" : 
                            category.id === "study" || category.id === "development" ? "info" : 
                            category.id === "personal" || category.id === "creative" ? "pink" : 
                            category.id === "home" ? "success" : 
                            category.id === "shopping" || category.id === "social" ? "cyan" : 
                            "warning"}))`,
    };
  }).filter(item => item.value > 0);

  if (categoryData.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Tasks by Category
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
          <LayoutGrid className="w-5 h-5 text-primary" />
          Tasks by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryDistributionChart;
