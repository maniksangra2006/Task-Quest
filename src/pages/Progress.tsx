import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProgressChart from "@/components/ProgressChart";
import CategoryDistributionChart from "@/components/CategoryDistributionChart";
import TimeOfDayChart from "@/components/TimeOfDayChart";
import CompletionTrendChart from "@/components/CompletionTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

const Progress = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      setTasks(tasksData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <TrendingUp className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.completed);
  const totalPoints = profile?.total_points || 0;
  const avgPointsPerTask =
    completedTasks.length > 0
      ? Math.round(totalPoints / completedTasks.length)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Progress Analytics
        </h1>
        <p className="text-muted-foreground">Track your productivity over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {tasks.length > 0
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks.length} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Avg Points/Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{avgPointsPerTask}</div>
            <p className="text-xs text-muted-foreground mt-1">XP per completed task</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {
                completedTasks.filter((t) => {
                  if (!t.completed_at) return false;
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(t.completed_at) > weekAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <CategoryDistributionChart tasks={tasks} />
        <TimeOfDayChart tasks={tasks} />
      </div>

      <div className="grid grid-cols-1 gap-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <CompletionTrendChart tasks={tasks} />
      </div>

      <div className="mt-6 animate-fade-in hover-scale" style={{ animationDelay: "0.4s" }}>
        <ProgressChart tasks={tasks} />
      </div>
    </div>
  );
};

export default Progress;
