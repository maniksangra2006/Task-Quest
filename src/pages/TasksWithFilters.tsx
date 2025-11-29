import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/TaskList";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import TaskFilters from "@/components/TaskFilters";
import CalendarView from "@/components/CalendarView";
import AITaskSuggestions from "@/components/AITaskSuggestions";
import { ListChecks, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isPast } from "date-fns";

const TasksWithFilters = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"list" | "calendar" | "ai">("list");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

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
        .order("deadline", { ascending: true });

      setTasks(tasksData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !task.completed) ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "overdue" && !task.completed && isPast(new Date(task.deadline)));

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ListChecks className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ListChecks className="w-8 h-8 text-primary" />
              My Tasks
            </h1>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          <CreateTaskDialog onTaskCreated={loadTasks} />
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
          className={view === "list" ? "bg-gradient-primary" : ""}
        >
          <ListChecks className="w-4 h-4 mr-2" />
          List
        </Button>
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          onClick={() => setView("calendar")}
          className={view === "calendar" ? "bg-gradient-primary" : ""}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </Button>
        <Button
          variant={view === "ai" ? "default" : "outline"}
          onClick={() => setView("ai")}
          className={view === "ai" ? "bg-gradient-primary" : ""}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Suggestions
        </Button>
      </div>

      {view === "list" && (
        <>
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categories={categories}
          />

          <Tabs defaultValue="active" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <TaskList tasks={activeTasks} onTasksChange={loadTasks} />
            </TabsContent>

            <TabsContent value="completed">
              <TaskList tasks={completedTasks} onTasksChange={loadTasks} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {view === "calendar" && (
        <div className="animate-fade-in">
          <CalendarView tasks={tasks} />
        </div>
      )}

      {view === "ai" && profile && (
        <div className="animate-fade-in">
          <AITaskSuggestions
            onTaskCreated={loadTasks}
            profile={profile}
            recentTasks={tasks}
          />
        </div>
      )}
    </div>
  );
};

export default TasksWithFilters;
