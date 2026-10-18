import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextField({ label, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-[13px] leading-4 font-semibold">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "h-12 rounded-md bg-background px-4 text-[15px] shadow-[inset_0_0_0_1.5px_var(--input)] outline-none placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_1.5px_var(--primary)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}
