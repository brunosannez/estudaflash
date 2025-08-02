import { cn } from "@/lib/utils";

interface PulseIndicatorProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "green" | "red" | "yellow";
  className?: string;
}

export function PulseIndicator({ 
  size = "md", 
  color = "primary", 
  className 
}: PulseIndicatorProps) {
  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  const colors = {
    primary: "bg-primary",
    green: "bg-green-500",
    red: "bg-red-500", 
    yellow: "bg-yellow-500"
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "rounded-full animate-pulse",
        sizes[size],
        colors[color]
      )} />
      <div className={cn(
        "absolute top-0 left-0 rounded-full animate-ping",
        sizes[size],
        colors[color],
        "opacity-75"
      )} />
    </div>
  );
}