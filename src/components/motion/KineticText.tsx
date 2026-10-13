import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface KineticHeadingProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  staggerDelay?: number;
  highlightWords?: string[];
  highlightClassName?: string;
}

export const KineticHeading: React.FC<KineticHeadingProps> = ({
  text,
  className = '',
  as = 'h1',
  staggerDelay = 0.04,
  highlightWords = [],
  highlightClassName = 'text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-sky-700 to-indigo-800'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (shouldReduceMotion) {
    const Tag = as;
    return (
      <Tag className={className}>
        {words.map((word, index) => {
          const isHighlighted = highlightWords.includes(word.replace(/[^a-zA-Z0-9]/g, ''));
          return (
            <span
              key={index}
              className={isHighlighted ? highlightClassName : undefined}
            >
              {word}{' '}
            </span>
          );
        })}
      </Tag>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.08
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 14,
      filter: 'blur(4px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => {
        const isHighlighted = highlightWords.includes(word.replace(/[^a-zA-Z0-9]/g, ''));
        return (
          <motion.span
            key={index}
            variants={wordVariants}
            className={`inline-block mr-[0.28em] ${isHighlighted ? highlightClassName : ''}`}
          >
            {word}
          </motion.span>
        );
      })}
    </Tag>
  );
};
