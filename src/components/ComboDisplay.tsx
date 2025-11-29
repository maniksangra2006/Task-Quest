import { Card, CardContent } from "@/components/ui/card";
import { Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ComboDisplayProps {
  currentCombo: number;
  highestCombo: number;
}

const ComboDisplay = ({ currentCombo, highestCombo }: ComboDisplayProps) => {
  const multiplier = Math.floor(currentCombo / 3) + 1;
  const hasCombo = currentCombo > 0;

  return (
    <Card className="bg-gradient-card border-border/50 overflow-hidden relative">
      {hasCombo && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-success/5 to-warning/5 animate-pulse" />
      )}
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Flame
                className={`w-6 h-6 ${
                  hasCombo ? "text-warning animate-pulse" : "text-muted-foreground"
                }`}
              />
              {hasCombo && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 text-warning" />
                </motion.div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Combo Streak</div>
              <div className="text-xs text-muted-foreground">Complete tasks on time</div>
            </div>
          </div>
          {hasCombo && (
            <motion.div
              className="flex items-center gap-1 bg-warning/20 px-3 py-1 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold text-warning">{multiplier}x XP</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-end gap-4">
          <div>
            <div className="text-3xl font-bold text-foreground">{currentCombo}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="pb-1">
            <div className="text-lg font-semibold text-muted-foreground">{highestCombo}</div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
        </div>

        {hasCombo && (
          <div className="mt-3 text-xs text-warning">
            Keep completing tasks on time to increase your multiplier!
          </div>
        )}
        {!hasCombo && (
          <div className="mt-3 text-xs text-muted-foreground">
            Complete 3 tasks on time to activate combo bonuses
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComboDisplay;
