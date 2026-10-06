// ============================================================================
// 1. FILE: src/components/TextAnimate.tsx (ENGINE ANIMASI TEKS KINETIK GLOBAL)
// ============================================================================
import React from 'react';
import { motion } from 'motion/react';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const KineticHeading: React.FC<TextRevealProps> = ({
  text,
  className = '',
  delay = 0,
  as: Component = 'h2',
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: '115%',
      rotateX: -45,
      filter: 'blur(6px)',
    },
    visible: {
      opacity: 1,
      y: '0%',
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 90,
      },
    },
  };

  return (
    <Component className={`overflow-hidden flex flex-wrap gap-x-[0.28em] gap-y-1 ${className}`}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-wrap gap-x-[0.28em] gap-y-1 inline-flex"
      >
        {words.map((word, index) => (
          <span key={index} className="overflow-hidden inline-block py-0.5">
            <motion.span variants={child} className="inline-block transform-gpu will-change-transform">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
};

export const LiquidBodyText: React.FC<{ text: string; className?: string; delay?: number }> = ({
  text,
  className = '',
  delay = 0.2,
}) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`leading-relaxed ${className}`}
    >
      {text}
    </motion.p>
  );
};
