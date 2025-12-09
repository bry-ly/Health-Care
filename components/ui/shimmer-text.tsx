"use client";

/**
 * @author: @dorian_baffier
 * @description: Shimmer Text
 * @version: 1.1.0
 * @date: 2025-12-09
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ShimmerTextProps {
  text: string;
  className?: string;
  wrapperClassName?: string;
  typewriter?: boolean;
  speedMsPerChar?: number;
  startDelayMs?: number;
}

export default function ShimmerText({
  text = "Text Shimmer",
  className,
  typewriter = false,
  speedMsPerChar = 32,
  startDelayMs = 120,
  wrapperClassName,
}: ShimmerTextProps) {
  const [rendered, setRendered] = useState(typewriter ? "" : text);

  useEffect(() => {
    if (!typewriter) {
      setRendered(text);
      return;
    }

    let frame = 0;
    const chars = Array.from(text);
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame += 1;
        setRendered(chars.slice(0, frame).join(""));
        if (frame >= chars.length) {
          clearInterval(interval);
        }
      }, speedMsPerChar);
    }, startDelayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, typewriter, speedMsPerChar, startDelayMs]);

  return (
    <div
      className={cn("flex items-center justify-center p-8", wrapperClassName)}
    >
      <motion.div
        className="relative overflow-hidden px-4 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className={cn(
            "bg-linear-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-size-[200%_100%] bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:via-neutral-600 dark:to-white",
            className
          )}
          animate={{
            backgroundPosition: ["200% center", "-200% center"],
          }}
          transition={{
            duration: 2.5,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          }}
          aria-live="polite"
        >
          {rendered}
        </motion.h1>
      </motion.div>
    </div>
  );
}
