import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        outline: "text-foreground shadow-[inset_0_0_0_1.5px_var(--input)] hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        dark: "bg-highlight-foreground text-highlight hover:brightness-125",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
