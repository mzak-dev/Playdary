import { useEffect, useState } from "react";

const TOP_OFFSET = 140;

export function useActiveSection(labels: string[]) {
  const [active, setActive] = useState(0);
  const key = labels.join("|");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const headings = [...document.querySelectorAll("h2")];
      const tops = labels.map((label) => headings.find((heading) => heading.textContent?.startsWith(label))?.getBoundingClientRect().top ?? Infinity);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const passed = tops.reduce((last, top, index) => (top <= TOP_OFFSET ? index : last), 0);
      setActive(atBottom ? labels.length - 1 : passed);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}
