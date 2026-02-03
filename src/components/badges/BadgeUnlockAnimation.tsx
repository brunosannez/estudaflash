
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDefinition, getRarityStyles, getRarityLabel } from '@/data/badgesCatalog';
import { X } from 'lucide-react';

interface BadgeUnlockAnimationProps {
  badge: BadgeDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

const Confetti = () => {
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 8 + Math.random() * 8
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const BadgeUnlockAnimation = ({ badge, isOpen, onClose }: BadgeUnlockAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, badge]);

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!badge) return null;

  const rarityStyles = getRarityStyles(badge.rarity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && <Confetti />}
          
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
              initial={{ scale: 0.3, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>

              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-lg font-bold text-primary">🎉 Nova Conquista!</span>
              </motion.div>

              {/* Badge Icon */}
              <motion.div
                className={`mx-auto mt-6 w-28 h-28 rounded-full flex items-center justify-center ${rarityStyles.bg} ${rarityStyles.border} border-4 ${rarityStyles.glow}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 10, 
                  stiffness: 200,
                  delay: 0.3 
                }}
              >
                <span className="text-5xl">{badge.icon}</span>
              </motion.div>

              {/* Badge Name */}
              <motion.h2
                className="mt-4 text-2xl font-bold text-gray-800"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {badge.name}
              </motion.h2>

              {/* Rarity Badge */}
              <motion.div
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${rarityStyles.bg} ${rarityStyles.text} ${rarityStyles.border} border`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                {getRarityLabel(badge.rarity)}
              </motion.div>

              {/* Description */}
              <motion.p
                className="mt-4 text-gray-600 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {badge.kidFriendlyDescription}
              </motion.p>

              {/* Celebration message */}
              <motion.p
                className="mt-6 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Continue assim, você está arrasando! 🚀
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockAnimation;
