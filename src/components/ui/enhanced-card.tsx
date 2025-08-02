import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  variant?: "default" | "success" | "warning" | "info";
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = false, glow = false, variant = "default", ...props }, ref) => {
    const variants = {
      default: "",
      success: "border-green-200 bg-green-50/50",
      warning: "border-yellow-200 bg-yellow-50/50", 
      info: "border-blue-200 bg-blue-50/50"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          variants[variant],
          hover && "transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
          glow && "shadow-lg shadow-primary/10",
          className
        )}
        {...props}
      />
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard };