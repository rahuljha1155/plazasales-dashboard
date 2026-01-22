import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center capitalize! whitespace-nowrap cursor-pointer! rounded-[2px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none cursor-pointer disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary  text-white font-semibold  hover:from-[#01283F] hover:to-[#01283F] active:from-primary active:to-primary focus:outline-none focus:ring-4 focus:ring-orange-300 !rounded-full transition-all duration-300  px-6 py-2 cursor-pointer",
        destructive:
          "border !rounded-full text-red-500! border-red-500! hover:text-white! hover:bg-red-500!",
        outline:
          "border border-input rounded-full! bg-background  hover:bg-accent  hover:text-accent-foreground",
        secondary:
          "bg-secondary !rounded-full text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent !rounded-full hover:text-accent-foreground",
        link: "text-primary !rounded-full underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 !rounded-full px-3 text-xs",
        lg: "h-10 !rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
