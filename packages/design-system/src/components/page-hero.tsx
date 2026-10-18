import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";
import DotGrid from "./dot-grid";

type PageHeroProps = HTMLAttributes<HTMLElement> & { contentClassName?: string };

export function PageHero({ children, className, contentClassName, ...props }: PageHeroProps) {
  return (
    <section className={cn("relative -mt-[68px] px-4 pt-[108px] pb-[104px] sm:px-8", className)} {...props}>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_55%,rgba(0,0,0,0.25))]">
          <DotGrid dotSize={3} gap={25} baseColor="#a1a1aa" activeColor="#1fa9ec" opacity={0.35} proximity={150} />
        </div>
        <div className="relative mx-auto h-full max-w-[1344px]">
          <i className="absolute top-[-80px] left-[6%] size-[340px] rounded-full bg-primary opacity-[0.28] blur-[80px]" />
          <i className="absolute top-[30px] right-[4%] size-[300px] rounded-full bg-cover-rose opacity-[0.28] blur-[80px]" />
        </div>
      </div>
      <div className={cn("relative z-[2] flex flex-col gap-5", contentClassName)}>{children}</div>
    </section>
  );
}
