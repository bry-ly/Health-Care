'use client';
import { ReactNode } from 'react';
import React from 'react';

export type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

export type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: unknown;
    item?: unknown;
  };
  preset?: PresetType;
  as?: React.ElementType;
  asChild?: React.ElementType;
};

function AnimatedGroup({
  children,
  className,
  as: Component = 'div',
}: AnimatedGroupProps) {
  return <Component className={className}>{children}</Component>;
}

export { AnimatedGroup };
