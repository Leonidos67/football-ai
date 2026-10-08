'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

function useAnimation() {
  const [animating, setAnimating] = useState(false);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  return {
    animating,
    start: () => {
      setAnimating(true);
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(() => setAnimating(false), 1500);
    },
    stop: () => setAnimating(false),
  };
}

// ⚽ Football — катится
export const FootballIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        className={`${className} ${animating ? 'animate-spin' : ''}`}
        style={{ animationDuration: '1s' }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7l3 2v4l-3 2-3-2V9z" fill="currentColor" stroke="none" />
        <path d="M12 2v5M12 17v5M2 12h5M17 12h5" opacity="0.3" />
      </svg>
    );
  }
);
FootballIcon.displayName = 'FootballIcon';

// 🎯 Target — пульсирует
export const TargetIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        className={`${className} ${animating ? 'animate-pulse' : ''}`}
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
);
TargetIcon.displayName = 'TargetIcon';

// 📈 Chart — линия растёт
export const ChartIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round" className={className}
      >
        <path d="M3 3v18h18" />
        <path
          d="M7 15l3-3 4 4 5-6"
          className={animating ? 'animate-pulse' : ''}
          style={{ transformOrigin: 'center' }}
        />
        <circle cx="7" cy="15" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="10" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="14" cy="16" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="10" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
);
ChartIcon.displayName = 'ChartIcon';

// 🏆 Trophy — светится
export const TrophyIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} ${animating ? 'animate-bounce' : ''}`}
        style={{ animationDuration: '0.8s' }}
      >
        <path d="M8 3h8v6a4 4 0 01-8 0V3z" />
        <path d="M8 5H5a2 2 0 000 4h3M16 5h3a2 2 0 010 4h-3" />
        <path d="M10 17h4M12 13v4M9 21h6" />
      </svg>
    );
  }
);
TrophyIcon.displayName = 'TrophyIcon';

// 🎫 Ticket — выезжает
export const TicketIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} ${animating ? 'animate-pulse' : ''}`}
      >
        <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 00-2 2 2 2 0 002 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 002-2 2 2 0 00-2-2V8z" />
        <path d="M13 6v2M13 12v2M13 18v0" strokeDasharray="2 2" />
      </svg>
    );
  }
);
TicketIcon.displayName = 'TicketIcon';

// 📸 Camera/Screenshot — вспышка
export const CameraIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} ${animating ? 'animate-pulse' : ''}`}
      >
        <path d="M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    );
  }
);
CameraIcon.displayName = 'CameraIcon';

// 🧠 Brain (Analytics) — пульсирует
export const BrainIcon = forwardRef<IconHandle, IconProps>(
  ({ size = 48, className }, ref) => {
    const { animating, start, stop } = useAnimation();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }));
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} ${animating ? 'animate-pulse' : ''}`}
      >
        <path d="M9 3a3 3 0 00-3 3v1a3 3 0 00-3 3v4a3 3 0 003 3v1a3 3 0 003 3h1V3H9z" />
        <path d="M15 3a3 3 0 013 3v1a3 3 0 013 3v4a3 3 0 01-3 3v1a3 3 0 01-3 3h-1V3h1z" />
      </svg>
    );
  }
);
BrainIcon.displayName = 'BrainIcon';