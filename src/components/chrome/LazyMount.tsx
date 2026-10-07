'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LazyMountProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  rootMargin?: string;
}

/** Mounts children only when the placeholder nears the viewport. */
const LazyMount: React.FC<LazyMountProps> = ({
  children,
  fallback,
  rootMargin = '0px',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const hashId = window.location.hash.replace('#', '');
    if (hashId && el.querySelector(`#${CSS.escape(hashId)}`)) {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{show ? children : fallback}</div>;
};

export default LazyMount;
