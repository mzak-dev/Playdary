import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";

type BlurTextProps = { text: string; className?: string; delay?: number };

export function BlurText({ text, className, delay = 0.06 }: BlurTextProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <span aria-label={text} className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          initial={reduced ? false : { filter: "blur(10px)", opacity: 0, y: -24 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * delay, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
