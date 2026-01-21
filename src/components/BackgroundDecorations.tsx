import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
      
      {/* 祥云装饰 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute w-32 h-16 md:w-48 md:h-24 opacity-20"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 200 100" fill="currentColor" className="text-primary">
            <ellipse cx="50" cy="50" rx="50" ry="30" />
            <ellipse cx="100" cy="45" rx="60" ry="35" />
            <ellipse cx="150" cy="50" rx="50" ry="30" />
          </svg>
        </motion.div>
      ))}
      
      {/* 闪烁星光 */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <Sparkles className="w-4 h-4 text-secondary" />
        </motion.div>
      ))}
      
      {/* 灯笼装饰 */}
      <motion.div
        className="absolute top-10 left-8 md:left-16"
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" className="text-primary drop-shadow-glow">
          <rect x="15" y="10" width="30" height="50" rx="15" fill="currentColor" opacity="0.9" />
          <rect x="10" y="8" width="40" height="4" fill="currentColor" />
          <rect x="10" y="60" width="40" height="4" fill="currentColor" />
          <line x1="30" y1="4" x2="30" y2="8" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="35" r="8" fill="#FFD700" opacity="0.8" />
          <path d="M 25 64 L 30 75 L 35 64" fill="#FFD700" />
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute top-10 right-8 md:right-16"
        animate={{ y: [0, -10, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" className="text-primary drop-shadow-glow">
          <rect x="15" y="10" width="30" height="50" rx="15" fill="currentColor" opacity="0.9" />
          <rect x="10" y="8" width="40" height="4" fill="currentColor" />
          <rect x="10" y="60" width="40" height="4" fill="currentColor" />
          <line x1="30" y1="4" x2="30" y2="8" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="35" r="8" fill="#FFD700" opacity="0.8" />
          <path d="M 25 64 L 30 75 L 35 64" fill="#FFD700" />
        </svg>
      </motion.div>
    </div>
  );
};
