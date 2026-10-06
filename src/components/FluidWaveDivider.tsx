import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface FluidWaveDividerProps {
  /**
   * Visual wave archetype:
   * - 'gentle': smooth flowing undulating wave
   * - 'crest': athletic ocean crest wave
   * - 'layered': dual-layer wave with luminous cyan underwater depth
   */
  variant?: 'gentle' | 'crest' | 'layered';
  /**
   * Wave direction:
   * - 'bottom': curves down into the next section
   * - 'top': curves upward from previous section
   */
  direction?: 'bottom' | 'top';
  /**
   * Base color of the connecting section
   */
  fillColor?: string;
  /**
   * Height utility class
   */
  heightClassName?: string;
  className?: string;
}

export const FluidWaveDivider: React.FC<FluidWaveDividerProps> = ({
  variant = 'layered',
  direction = 'bottom',
  fillColor = '#030812',
  heightClassName = 'h-12 sm:h-16 md:h-20',
  className = '',
}) => {
  const { scrollYProgress } = useScroll();
  // Subtle horizontal scroll drift for tactile depth
  const waveX1 = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const waveX2 = useTransform(scrollYProgress, [0, 1], [25, -25]);

  const isFlipped = direction === 'top';

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none z-10 ${heightClassName} ${className}`}
      style={{
        transform: isFlipped ? 'rotate(180deg)' : 'none',
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {/* Layer 1: Ambient Cyan Bioluminescent Crest (Subtle Light Highlight) */}
        <motion.div
          style={{ x: waveX2 }}
          animate={{
            x: ['-2%', '2%', '-2%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-x-[-10%] inset-y-0 w-[120%] h-full opacity-40"
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-full text-cyan-500/20 fill-current"
          >
            <path d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </motion.div>

        {/* Layer 2: Secondary Teal Wave (Depth layer) */}
        <motion.div
          style={{ x: waveX1 }}
          animate={{
            x: ['2%', '-2%', '2%'],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-x-[-10%] inset-y-0 w-[120%] h-full opacity-60"
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-full text-[#08203e]/80 fill-current"
          >
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </motion.div>

        {/* Layer 3: Solid Primary Base Wave (Seamless structural bond) */}
        <div className="absolute inset-0 w-full h-full">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ fill: fillColor }}
          >
            {variant === 'crest' ? (
              <path d="M0,40 C320,110 420,-10 720,50 C1020,110 1180,10 1440,40 L1440,120 L0,120 Z" />
            ) : variant === 'gentle' ? (
              <path d="M0,50 C360,20 720,80 1080,40 C1260,20 1380,45 1440,50 L1440,120 L0,120 Z" />
            ) : (
              <path d="M0,60 C240,15 480,95 720,55 C960,15 1200,85 1440,50 L1440,120 L0,120 Z" />
            )}
          </svg>
        </div>

        {/* Subtle luminous line edge at the crest boundary */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>
    </div>
  );
};
