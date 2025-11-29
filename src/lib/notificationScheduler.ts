import { supabase } from "@/integrations/supabase/client";
import { showNotification, requestNotificationPermission } from "./notifications";
import { isPast, differenceInMinutes } from "date-fns";

// Check for upcoming tasks and send notifications
export const checkUpcomingTasks = async () => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false);

    if (!tasks) return;

    const now = new Date();

    tasks.forEach((task) => {
      const deadline = new Date(task.deadline);
      if (isPast(deadline)) return;

      const minutesUntilDeadline = differenceInMinutes(deadline, now);

      // Notify at 5 minutes
      if (minutesUntilDeadline === 5) {
        showNotification("Task Deadline Soon! 🔥", {
          body: `"${task.title}" is due in 5 minutes!`,
          tag: `task-5min-${task.id}`,
          requireInteraction: true,
        });
      }

      // Notify at 1 minute
      if (minutesUntilDeadline === 1) {
        showNotification("Task Deadline Imminent! ⚡", {
          body: `"${task.title}" is due in 1 minute!`,
          tag: `task-1min-${task.id}`,
          requireInteraction: true,
        });
      }
    });
  } catch (error) {
    console.error("Error checking upcoming tasks:", error);
  }
};

// Start periodic check every minute
export const startNotificationScheduler = () => {
  // Check immediately
  checkUpcomingTasks();

  // Then check every minute
  const intervalId = setInterval(checkUpcomingTasks, 60000);

  return () => clearInterval(intervalId);
};
