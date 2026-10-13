import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface WordRotatorProps {
  words: string[];
  interval?: number;
  className?: string;
}

export const WordRotator: React.FC<WordRotatorProps> = ({
  words,
  interval = 2800,
  className = ''
}) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  if (shouldReduceMotion) {
    return <span className={className}>{words[index]}</span>;
  }

  return (
    <span className="inline-block relative overflow-hidden align-baseline min-w-[210px] sm:min-w-[260px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
          className={`inline-block whitespace-nowrap font-black ${className}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
