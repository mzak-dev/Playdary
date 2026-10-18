import { EmptyState } from "@playdary/design-system";
import type { ComponentProps } from "react";
import { useRandomCovers } from "../lib/covers";

export function GameEmptyState(props: Omit<ComponentProps<typeof EmptyState>, "covers">) {
  return <EmptyState {...props} covers={useRandomCovers()} />;
}
