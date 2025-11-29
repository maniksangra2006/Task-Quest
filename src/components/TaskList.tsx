import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import BadgeCelebration from "@/components/BadgeCelebration";
import { triggerTaskCompleteConfetti } from "@/lib/confetti";
import { getCategoryById } from "@/lib/categories";
import { applyComboBonus, calculateComboMultiplier } from "@/lib/gamification";

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  completed: boolean;
  priority: string;
  points: number;
  category: string | null;
}

interface TaskListProps {
  tasks: Task[];
  onTasksChange: () => void;
}

const TaskList = ({ tasks, onTasksChange }: TaskListProps) => {
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [celebratingBadge, setCelebratingBadge] = useState<any>(null);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setCompletingTasks((prev) => new Set(prev).add(taskId));

    try {
      // Get task details
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Check if task is being completed on time or late
      const isOnTime = !isPast(new Date(task.deadline));

      // Update task completion status
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (updateError) throw updateError;

      if (!completed) {
        // Get current user profile for combo
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("current_combo, highest_combo")
          .eq("id", user.id)
          .single();

        let newCombo = (profileData?.current_combo || 0);
        let comboMultiplier = 1;

        // Update combo based on whether task was completed on time
        if (isOnTime) {
          newCombo += 1;
          comboMultiplier = calculateComboMultiplier(newCombo);

          // Update combo in profile
          const { error: comboError } = await supabase
            .from("profiles")
            .update({
              current_combo: newCombo,
              highest_combo: Math.max(newCombo, profileData?.highest_combo || 0),
            })
            .eq("id", user.id);

          if (comboError) console.error("Error updating combo:", comboError);

          // Show combo bonus notification
          if (newCombo >= 3) {
            toast.success(`${newCombo}x Combo! ${comboMultiplier}x XP Multiplier!`, {
              icon: <Zap className="w-5 h-5 text-warning" />,
              duration: 3000,
            });
          }
        } else {
          // Reset combo if task was late
          if (newCombo > 0) {
            await supabase
              .from("profiles")
              .update({ current_combo: 0 })
              .eq("id", user.id);

            toast.error("Combo broken! Complete tasks on time to maintain your streak.", {
              icon: "💔",
            });
          }
        }

        // Trigger task completion confetti
        triggerTaskCompleteConfetti();
        
        // Call the game mechanics function to update stats and award badges
        const { data: result, error: funcError } = await supabase.rpc(
          "handle_task_completion",
          { task_id: taskId }
        );

        if (funcError) {
          console.error("Error updating game stats:", funcError);
        } else if (result) {
          const gameResult = result as any;
          
          // Calculate bonus points with combo multiplier
          const bonusPoints = isOnTime && newCombo >= 3 
            ? applyComboBonus(gameResult.points_earned, newCombo) - gameResult.points_earned
            : 0;

          // Apply combo bonus if applicable
          if (bonusPoints > 0) {
            const { data: currentProfile } = await supabase
              .from("profiles")
              .select("total_points")
              .eq("id", user.id)
              .single();

            if (currentProfile) {
              await supabase
                .from("profiles")
                .update({
                  total_points: (currentProfile.total_points || 0) + bonusPoints,
                })
                .eq("id", user.id);
            }
          }

          // Show points earned with combo bonus
          const totalPoints = gameResult.points_earned + bonusPoints;
          toast.success(
            bonusPoints > 0 
              ? `Task completed! +${gameResult.points_earned} XP + ${bonusPoints} combo bonus = ${totalPoints} XP`
              : `Task completed! +${gameResult.points_earned} XP`,
            { icon: "🎉" }
          );

          // Show badge celebration with confetti
          if (gameResult.new_badges && gameResult.new_badges.length > 0) {
            // Show first badge with full celebration
            setCelebratingBadge(gameResult.new_badges[0]);
            
            // Show remaining badges as toasts
            if (gameResult.new_badges.length > 1) {
              gameResult.new_badges.slice(1).forEach((badge: any) => {
                toast.success(`Badge unlocked: ${badge.icon} ${badge.name} (+${badge.points} XP)`, {
                  icon: "🏆",
                  duration: 5000,
                });
              });
            }
          }
        }
      }

      onTasksChange();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast.success("Task deleted");
      onTasksChange();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDeadlineInfo = (deadline: string) => {
    const date = new Date(deadline);
    if (isToday(date)) return { text: "Today", className: "bg-warning text-warning-foreground" };
    if (isTomorrow(date)) return { text: "Tomorrow", className: "bg-primary text-primary-foreground" };
    if (isPast(date)) return { text: "Overdue", className: "bg-destructive text-destructive-foreground" };
    return { text: format(date, "MMM d"), className: "bg-muted text-muted-foreground" };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <>
      <BadgeCelebration 
        badge={celebratingBadge} 
        onComplete={() => setCelebratingBadge(null)} 
      />
      <div className="space-y-3">
        {tasks.map((task) => {
        const deadlineInfo = getDeadlineInfo(task.deadline);
        const isCompleting = completingTasks.has(task.id);

        return (
          <Card
            key={task.id}
            className={`p-4 bg-gradient-card border-border/50 transition-all duration-300 ${
              task.completed ? "opacity-60" : "hover:shadow-glow-primary"
            }`}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                disabled={isCompleting}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-foreground mb-1 ${
                    task.completed ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {task.category && (() => {
                    const category = getCategoryById(task.category);
                    if (category) {
                      const CategoryIcon = category.icon;
                      return (
                        <Badge className={`${category.color} bg-transparent border`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {category.name}
                        </Badge>
                      );
                    }
                    return null;
                  })()}
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={deadlineInfo.className}>
                    <Clock className="w-3 h-3 mr-1" />
                    {deadlineInfo.text} - {format(new Date(task.deadline), "h:mm a")}
                  </Badge>
                  <Badge variant="outline">
                    <Flame className="w-3 h-3 mr-1 text-primary" />
                    {task.points} XP
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTask(task.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
        })}
      </div>
    </>
  );
};

export default TaskList;
