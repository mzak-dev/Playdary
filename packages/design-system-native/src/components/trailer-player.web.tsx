import { createElement } from "react";

type TrailerPlayerProps = { videoId: string; width: number; height: number };

export default function TrailerPlayer({ videoId, width, height }: TrailerPlayerProps) {
  return createElement("iframe", {
    src: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`,
    width,
    height,
    style: { border: 0 },
    allow: "autoplay; encrypted-media",
    allowFullScreen: true,
  });
}
