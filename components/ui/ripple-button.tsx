"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  rippleColor?: string;
  duration?: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

type RippleItem = {
  x: number;
  y: number;
  size: number;
  key: number;
};

function ButtonRipple({
  ripple,
  duration,
  rippleColor,
  onDone,
}: {
  ripple: RippleItem;
  duration: string;
  rippleColor: string;
  onDone: (key: number) => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onDone(ripple.key);
    }, parseInt(duration, 10));

    return () => {
      clearTimeout(timeout);
    };
  }, [duration, onDone, ripple.key]);

  return (
    <span
      className="animate-rippling absolute rounded-full opacity-35 pointer-events-none"
      style={
        {
          width: `${ripple.size}px`,
          height: `${ripple.size}px`,
          top: `${ripple.y}px`,
          left: `${ripple.x}px`,
          backgroundColor: rippleColor,
          transform: `scale(0)`,
          "--duration": duration,
        } as React.CSSProperties
      }
    />
  );
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  RippleButtonProps
>(
  (
    {
      href,
      className,
      children,
      rippleColor = "rgba(255, 255, 255, 0.4)",
      duration = "600ms",
      onClick,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<Array<RippleItem>>([]);
    const nextKeyRef = useRef(0);

    const removeRipple = useCallback((key: number) => {
      setButtonRipples((prevRipples) =>
        prevRipples.filter((ripple) => ripple.key !== key)
      );
    }, []);

    const createRipple = (
      event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>
    ) => {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      nextKeyRef.current += 1;
      const newRipple = { x, y, size, key: nextKeyRef.current };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    const handleClick = (
      event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>
    ) => {
      createRipple(event);
      onClick?.(event as any);
    };

    const rippleElements = (
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {buttonRipples.map((ripple) => (
          <ButtonRipple
            key={ripple.key}
            duration={duration}
            onDone={removeRipple}
            ripple={ripple}
            rippleColor={rippleColor}
          />
        ))}
      </span>
    );

    const baseClasses = cn(
      "relative inline-flex items-center justify-center overflow-hidden cursor-pointer select-none transition-all duration-300",
      className
    );

    // When href is provided, render Next.js Link
    if (href) {
      return (
        <Link
          href={href}
          className={baseClasses}
          onClick={handleClick}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as any)}
        >
          <span className="relative z-10 flex items-center gap-[inherit] text-[inherit]">
            {children}
          </span>
          {rippleElements}
        </Link>
      );
    }

    // Default button rendering
    return (
      <button
        type={type}
        disabled={disabled}
        className={baseClasses}
        onClick={handleClick}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-[inherit] text-[inherit]">
          {children}
        </span>
        {rippleElements}
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";
