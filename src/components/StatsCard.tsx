import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean | string;
}

const StatsCard = ({ title, value, icon: Icon, gradient }: StatsCardProps) => {
  const getGradientClasses = () => {
    if (!gradient) return "bg-gradient-card";
    if (gradient === true) return "bg-gradient-primary text-primary-foreground shadow-glow-primary";
    
    const gradientMap: Record<string, string> = {
      info: "bg-gradient-info text-info-foreground shadow-glow-info",
      pink: "bg-gradient-pink text-pink-foreground shadow-glow-pink",
      cyan: "bg-gradient-cyan text-cyan-foreground shadow-glow-cyan",
      success: "bg-gradient-success text-success-foreground shadow-glow-success",
    };
    
    return gradientMap[gradient] || "bg-gradient-card";
  };

  return (
    <Card
      className={`${getGradientClasses()} border-border/50 transition-all hover:scale-105`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${gradient ? "opacity-90" : "text-muted-foreground"}`}>
              {title}
            </p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              gradient ? "bg-foreground/20" : "bg-primary/20"
            }`}
          >
            <Icon className={`w-6 h-6 ${gradient ? "" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
