import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Sparkles } from "lucide-react";
import { triggerBadgeConfetti } from "@/lib/confetti";

interface BadgeCelebrationProps {
  badge: {
    name: string;
    icon: string;
    points: number;
  } | null;
  onComplete: () => void;
}

const BadgeCelebration = ({ badge, onComplete }: BadgeCelebrationProps) => {
  useEffect(() => {
    if (badge) {
      triggerBadgeConfetti();
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onComplete]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="bg-gradient-card border-2 border-primary/50 rounded-2xl p-8 shadow-glow-primary max-w-md mx-4"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
              className="text-8xl text-center mb-4"
            >
              {badge.icon}
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Badge Unlocked!</h2>
              </div>
              <h3 className="text-3xl font-bold mb-2">{badge.name}</h3>
              <div className="flex items-center justify-center gap-2 text-xl text-success">
                <Sparkles className="w-5 h-5" />
                <span>+{badge.points} XP</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeCelebration;
