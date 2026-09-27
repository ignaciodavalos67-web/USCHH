import React from "react";

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className = "" }: ScrollIndicatorProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 select-none pointer-events-none text-center ${className}`}
    >
      <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium text-[#F7E2A3]/90">
        DESLIZA HACIA ABAJO
      </span>
      <div className="w-5 h-8 border border-[#F7E2A3]/40 rounded-full flex justify-center items-start pt-1.5">
        <span className="w-1 h-2 bg-[#F7E2A3] rounded-full animate-bounce" />
      </div>
    </div>
  );
}
