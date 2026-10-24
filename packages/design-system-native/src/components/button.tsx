import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { cn } from "../lib/cn";
import { wrapText } from "../lib/text-children";

const buttonVariants = cva("flex-row items-center justify-center gap-2 rounded-full active:opacity-80 disabled:opacity-45", {
  variants: {
    variant: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      outline: "border-[1.5px] border-input",
      ghost: "",
      dark: "bg-highlight-foreground",
    },
    size: {
      sm: "h-8 px-3.5",
      md: "h-10 px-5",
      lg: "h-12 px-7",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

const labelVariants = cva("font-sans-semibold", {
  variants: {
    variant: {
      primary: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      dark: "text-highlight",
    },
    size: { sm: "text-[13px]", md: "text-sm", lg: "text-[15px]" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonProps = Omit<PressableProps, "children"> & VariantProps<typeof buttonVariants> & { children: ReactNode; className?: string };

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  const label = labelVariants({ variant, size });
  return (
    <Pressable accessibilityRole="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {wrapText(children, label)}
    </Pressable>
  );
}
