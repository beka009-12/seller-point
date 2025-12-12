"use client";
import { useEffect, useRef } from "react";
import { useMotionValue } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const isInView = true; // Если хочешь, можно добавить useInView

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes(".")) {
      const decimals = str.split(".")[1];
      if (parseInt(decimals) !== 0) return decimals.length;
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatNumber = (num: number) => {
    const options: Intl.NumberFormatOptions = {
      useGrouping: !!separator,
      minimumFractionDigits: maxDecimals,
      maximumFractionDigits: maxDecimals,
    };
    const formatted = Intl.NumberFormat("en-US", options).format(num);
    return separator ? formatted.replace(/,/g, separator) : formatted;
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = String(direction === "down" ? to : from);
    }
  }, [from, to, direction]);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === "function") onStart();

      const startValue = direction === "down" ? to : from;
      const endValue = direction === "down" ? from : to;
      const startTime = performance.now() + delay * 1000;

      const step = (currentTime: number) => {
        const elapsed = (currentTime - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1); // 0 → 1
        const value = startValue + (endValue - startValue) * t;
        motionValue.set(value);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          motionValue.set(endValue); // зафиксировать число точно
          if (typeof onEnd === "function") onEnd();
        }
      };

      requestAnimationFrame(step);
    }
  }, [
    isInView,
    startWhen,
    direction,
    from,
    to,
    delay,
    duration,
    motionValue,
    onStart,
    onEnd,
  ]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNumber(latest);
      }
    });
    return () => unsubscribe();
  }, [motionValue, separator, maxDecimals]);

  return (
    <span
      style={{ color: "#fb4517", fontWeight: "700" }}
      className={className}
      ref={ref}
    />
  );
}
