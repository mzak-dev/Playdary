import "@videojs/react/video/skin.css";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";

type TrailerPlayerProps = { videoId: string; poster: string };

const HIDE_YOUTUBE_TITLE_BAR = { position: "absolute", top: -72, left: 0, width: "100%", height: "calc(100% + 72px)" } as const;

export default function TrailerPlayer({ videoId, poster }: TrailerPlayerProps) {
  return (
    <VideoPlayer>
      <VideoSkin style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <YouTubeVideo src={videoId} poster={poster} autoplay playsInline style={HIDE_YOUTUBE_TITLE_BAR} />
      </VideoSkin>
    </VideoPlayer>
  );
}
