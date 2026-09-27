import React from "react";

interface SceneHeadingProps {
  children: React.ReactNode;
  className?: string;
  theme?: "dark" | "light";
}

export function SceneHeading({
  children,
  className = "",
  theme = "dark",
}: SceneHeadingProps) {
  const colorClass = theme === "dark" ? "text-[#F8F7F2]" : "text-[#101820]";
  return (
    <h2
      className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.05] uppercase ${colorClass} ${className}`}
    >
      {children}
    </h2>
  );
}

interface AccentLineProps {
  className?: string;
}

export function AccentLine({ className = "" }: AccentLineProps) {
  return (
    <div
      className={`h-[2px] w-14 bg-[#F7E2A3] rounded-full my-4 ${className}`}
      aria-hidden="true"
    />
  );
}

interface EditorialTagProps {
  children: React.ReactNode;
  theme?: "dark" | "light";
  className?: string;
}

export function EditorialTag({
  children,
  theme = "dark",
  className = "",
}: EditorialTagProps) {
  const styles =
    theme === "dark"
      ? "border-[#F8F7F2]/20 text-[#F8F7F2]/80 bg-[#101820]/30"
      : "border-[#101820]/20 text-[#101820]/80 bg-white/40";
  return (
    <span
      className={`inline-block px-3 py-1 text-[10px] sm:text-xs font-mono tracking-widest uppercase border rounded-full backdrop-blur-sm ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
