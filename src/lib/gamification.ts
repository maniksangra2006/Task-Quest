export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "Novice", minPoints: 0, maxPoints: 99, color: "text-gray-400" },
  { level: 2, name: "Apprentice", minPoints: 100, maxPoints: 299, color: "text-blue-400" },
  { level: 3, name: "Adept", minPoints: 300, maxPoints: 599, color: "text-green-400" },
  { level: 4, name: "Expert", minPoints: 600, maxPoints: 999, color: "text-purple-400" },
  { level: 5, name: "Master", minPoints: 1000, maxPoints: 1999, color: "text-orange-400" },
  { level: 6, name: "Grandmaster", minPoints: 2000, maxPoints: 3999, color: "text-red-400" },
  { level: 7, name: "Legend", minPoints: 4000, maxPoints: 7999, color: "text-yellow-400" },
  { level: 8, name: "Mythic", minPoints: 8000, maxPoints: 15999, color: "text-pink-400" },
  { level: 9, name: "Immortal", minPoints: 16000, maxPoints: 31999, color: "text-cyan-400" },
  { level: 10, name: "Divine", minPoints: 32000, maxPoints: Infinity, color: "text-primary" },
];

export const getLevelInfo = (points: number): LevelInfo => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (points: number): number => {
  const currentLevel = getLevelInfo(points);
  if (currentLevel.maxPoints === Infinity) return 100;
  
  const progress = ((points - currentLevel.minPoints) / (currentLevel.maxPoints - currentLevel.minPoints + 1)) * 100;
  return Math.min(progress, 100);
};

export const getPointsToNextLevel = (points: number): number => {
  const currentLevel = getLevelInfo(points);
  if (currentLevel.maxPoints === Infinity) return 0;
  return currentLevel.maxPoints - points + 1;
};

export const calculateDailyReward = (currentStreak: number): number => {
  // Base reward + streak bonus
  const baseReward = 20;
  const streakBonus = Math.min(currentStreak * 5, 100); // Cap at 100 bonus points
  return baseReward + streakBonus;
};

export const calculateComboMultiplier = (currentCombo: number): number => {
  // Every 3 tasks in combo adds 1x multiplier
  // Combo 0-2: 1x, Combo 3-5: 2x, Combo 6-8: 3x, etc.
  return Math.floor(currentCombo / 3) + 1;
};

export const applyComboBonus = (basePoints: number, currentCombo: number): number => {
  const multiplier = calculateComboMultiplier(currentCombo);
  return Math.round(basePoints * multiplier);
};

export const checkBadgeUnlock = (
  profile: any,
  badges: any[],
  userBadges: any[]
): { badge: any; unlocked: boolean }[] => {
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));
  const results: { badge: any; unlocked: boolean }[] = [];

  badges.forEach((badge) => {
    if (earnedBadgeIds.has(badge.id)) {
      results.push({ badge, unlocked: false });
      return;
    }

    let shouldUnlock = false;

    switch (badge.requirement_type) {
      case "tasks_completed":
        shouldUnlock = profile.tasks_completed >= badge.requirement_value;
        break;
      case "current_streak":
        shouldUnlock = profile.current_streak >= badge.requirement_value;
        break;
      case "total_points":
        shouldUnlock = profile.total_points >= badge.requirement_value;
        break;
      default:
        break;
    }

    results.push({ badge, unlocked: shouldUnlock });
  });

  return results;
};
