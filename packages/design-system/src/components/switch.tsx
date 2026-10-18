import { cn } from "../lib/cn";

type SwitchProps = { checked: boolean; onChange: (checked: boolean) => void; label: string };

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-[22px] before:rounded-full before:bg-background before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.3,1.3,0.5,1)]",
        checked ? "bg-primary before:translate-x-5" : "bg-input",
      )}
    />
  );
}
