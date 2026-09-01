"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BlackHoleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "amber" | "cyan" | "purple";
}

export const BlackHoleButton = React.forwardRef<
  HTMLButtonElement,
  BlackHoleButtonProps
>(({ children, className, glowColor = "amber", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden rounded-full font-mono text-sm font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 group",
        "bg-black border border-amber-500/50 shadow-[0_0_20px_rgba(255,140,0,0.3)]",
        className
      )}
      {...props}
    >
      {/* Relativistic Accretion Disk Conic Spinner */}
      <span className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#ff8c00_60deg,#38bdf8_120deg,#c084fc_180deg,transparent_240deg)] opacity-75 group-hover:opacity-100 transition-opacity" />

      {/* Schwarzschild Event Horizon Core */}
      <span className="absolute inset-[1.5px] rounded-full bg-gradient-to-b from-slate-900 to-black z-0 transition-colors group-hover:from-slate-800" />

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
});

BlackHoleButton.displayName = "BlackHoleButton";

export default BlackHoleButton;
