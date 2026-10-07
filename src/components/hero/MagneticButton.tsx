'use client';

import React, { useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from 'framer-motion';

type MagneticButtonProps = HTMLMotionProps<'button'> & {
  /** How far (px) the button may be pulled toward the cursor */
  pull?: number;
};

/** Button that leans toward the cursor while hovered, then springs back. */
const MagneticButton: React.FC<MagneticButtonProps> = ({
  pull = 18,
  children,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      if (reduceMotion || event.pointerType !== 'mouse') return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width - 0.5) * pull * 2);
      y.set(((event.clientY - rect.top) / rect.height - 0.5) * pull * 2);
    },
    [onPointerMove, pull, reduceMotion, x, y],
  );

  const handleLeave = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      x.set(0);
      y.set(0);
    },
    [onPointerLeave, x, y],
  );

  return (
    <motion.button
      {...props}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ ...style, x: springX, y: springY }}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
