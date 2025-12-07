"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const themes = [
  {
    key: "system",
    label: "System",
  },
  {
    key: "light",
    label: "Light",
  },
  {
    key: "dark",
    label: "Dark",
  },
];

export type ThemeSwitcherProps = {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) => {
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value ?? (currentTheme as "light" | "dark" | "system"),
    onChange,
  });
  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => {
      setTheme(themeKey);
      setNextTheme(themeKey);
    },
    [setTheme, setNextTheme]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {themes.map(({ key, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className={cn(
              "relative flex-1 px-3 py-1 text-sm font-medium transition-all cursor-pointer",
              isActive ? "text-foreground" : "hover:text-foreground"
            )}
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
