import React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: "section" | "div" | "main";
  maxWidth?: string;
  className?: string;
  noPadding?: boolean;
}

/**
 * A reusable container component that enforces the brand's standard horizontal padding.
 * Default horizontal padding is 10px (px-2.5).
 */
export const SectionContainer = ({
  children,
  as: Component = "section",
  maxWidth = "max-w-[1400px]",
  className,
  noPadding = false,
  ...props
}: SectionContainerProps) => {
  return (
    <Component
      className={cn(
        "w-full mx-auto overflow-x-hidden",
        noPadding ? "px-0" : "px-2.5",
        className
      )}
      data-no-padding={noPadding}
      {...props}
    >
      <div className={cn("mx-auto w-full", maxWidth)}>
        {children}
      </div>
    </Component>
  );
};
