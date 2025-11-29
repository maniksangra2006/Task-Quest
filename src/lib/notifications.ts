export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }
};

export const scheduleTaskNotification = (taskTitle: string, deadline: Date) => {
  const now = new Date();
  const timeUntilDeadline = deadline.getTime() - now.getTime();
  
  // Notify 5 minutes before deadline
  const fiveMinutesBefore = timeUntilDeadline - 5 * 60 * 1000;
  
  if (fiveMinutesBefore > 0 && fiveMinutesBefore <= 24 * 60 * 60 * 1000) { // Only schedule if within 24 hours
    setTimeout(() => {
      showNotification("Task Deadline Soon! 🔥", {
        body: `"${taskTitle}" is due in 5 minutes!`,
        tag: `task-5min-${taskTitle}`,
        requireInteraction: true,
      });
    }, fiveMinutesBefore);
  }

  // Notify 1 minute before deadline
  const oneMinuteBefore = timeUntilDeadline - 1 * 60 * 1000;
  
  if (oneMinuteBefore > 0 && oneMinuteBefore <= 24 * 60 * 60 * 1000) { // Only schedule if within 24 hours
    setTimeout(() => {
      showNotification("Task Deadline Imminent! ⚡", {
        body: `"${taskTitle}" is due in 1 minute!`,
        tag: `task-1min-${taskTitle}`,
        requireInteraction: true,
      });
    }, oneMinuteBefore);
  }
};

export const showStreakReminder = (currentStreak: number) => {
  showNotification("Don't Break Your Streak! 🔥", {
    body: `You have a ${currentStreak}-day streak! Complete a task today to keep it going.`,
    tag: "streak-reminder",
  });
};

export const showDailyReward = (points: number) => {
  showNotification("Daily Reward Claimed! 🎁", {
    body: `You earned ${points} bonus points for logging in today!`,
    tag: "daily-reward",
  });
};

export const showLevelUp = (newLevel: number, levelName: string) => {
  showNotification(`Level Up! 🎉`, {
    body: `Congratulations! You've reached Level ${newLevel} - ${levelName}!`,
    tag: "level-up",
  });
};

export const showOverdueTaskPenalty = (taskTitle: string, penalty: number) => {
  showNotification("Task Overdue! ⚠️", {
    body: `"${taskTitle}" is overdue. -${penalty} XP penalty applied.`,
    tag: `overdue-${taskTitle}`,
  });
};

export const showBadgeUnlocked = (badgeName: string, badgeIcon: string) => {
  showNotification(`Badge Unlocked! ${badgeIcon}`, {
    body: `You've earned the "${badgeName}" badge!`,
    tag: `badge-${badgeName}`,
  });
};
