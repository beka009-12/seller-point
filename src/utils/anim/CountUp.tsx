"use client";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
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
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

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

  // Проверяем, это перезагрузка страницы (F5)
  useEffect(() => {
    const navigationType = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    // Анимация только при reload (F5) или первой загрузке
    if (
      navigationType &&
      (navigationType.type === "reload" || navigationType.type === "navigate")
    ) {
      setShouldAnimate(true);
    } else {
      // Клиентский переход - показываем сразу конечное значение
      const endValue = direction === "down" ? from : to;
      if (ref.current) {
        ref.current.textContent = formatNumber(endValue);
      }
    }
  }, []);

  // Анимация счетчика
  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current) {
      hasAnimated.current = true;

      if (typeof onStart === "function") onStart();

      const startValue = direction === "down" ? to : from;
      const endValue = direction === "down" ? from : to;
      const startTime = performance.now() + delay * 1000;

      const step = (currentTime: number) => {
        const elapsed = (currentTime - startTime) / 1000;

        if (elapsed < 0) {
          requestAnimationFrame(step);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        const currentValue = startValue + (endValue - startValue) * progress;

        if (ref.current) {
          ref.current.textContent = formatNumber(currentValue);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          if (ref.current) {
            ref.current.textContent = formatNumber(endValue);
          }
          if (typeof onEnd === "function") onEnd();
        }
      };

      requestAnimationFrame(step);
    }
  }, [shouldAnimate, direction, from, to, delay, duration, onStart, onEnd]);

  // Если не должна быть анимация, показываем сразу конечное значение
  useEffect(() => {
    if (!shouldAnimate && ref.current) {
      const endValue = direction === "down" ? from : to;
      ref.current.textContent = formatNumber(endValue);
    }
  }, [shouldAnimate, from, to, direction]);

  return (
    <span
      style={{ color: "#fb4517", fontWeight: "700" }}
      className={className}
      ref={ref}
    />
  );
}
