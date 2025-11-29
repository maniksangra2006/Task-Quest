import { LucideIcon, Briefcase, GraduationCap, Heart, Home, ShoppingCart, Dumbbell, Palette, Users, Lightbulb, Code } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

export const TASK_CATEGORIES: Category[] = [
  {
    id: "work",
    name: "Work",
    icon: Briefcase,
    color: "text-primary",
    gradient: "bg-gradient-primary",
  },
  {
    id: "study",
    name: "Study",
    icon: GraduationCap,
    color: "text-info",
    gradient: "bg-gradient-info",
  },
  {
    id: "personal",
    name: "Personal",
    icon: Heart,
    color: "text-pink",
    gradient: "bg-gradient-pink",
  },
  {
    id: "home",
    name: "Home",
    icon: Home,
    color: "text-success",
    gradient: "bg-gradient-success",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: ShoppingCart,
    color: "text-cyan",
    gradient: "bg-gradient-cyan",
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: Dumbbell,
    color: "text-warning",
    gradient: "bg-gradient-success",
  },
  {
    id: "creative",
    name: "Creative",
    icon: Palette,
    color: "text-pink",
    gradient: "bg-gradient-pink",
  },
  {
    id: "social",
    name: "Social",
    icon: Users,
    color: "text-cyan",
    gradient: "bg-gradient-cyan",
  },
  {
    id: "projects",
    name: "Projects",
    icon: Lightbulb,
    color: "text-primary",
    gradient: "bg-gradient-primary",
  },
  {
    id: "development",
    name: "Development",
    icon: Code,
    color: "text-info",
    gradient: "bg-gradient-info",
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return TASK_CATEGORIES.find((cat) => cat.id === id);
};

export const PRIORITY_XP = {
  urgent: 50,
  high: 30,
  medium: 20,
  low: 10,
};

export const getPriorityXP = (priority: string): number => {
  return PRIORITY_XP[priority as keyof typeof PRIORITY_XP] || 20;
};
