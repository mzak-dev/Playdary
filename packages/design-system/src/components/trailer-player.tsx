import "@videojs/react/video/skin.css";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";

type TrailerPlayerProps = { videoId: string; poster: string };

const HIDE_YOUTUBE_TITLE_BAR = "size-full overflow-hidden [&_iframe]:absolute [&_iframe]:top-[-72px] [&_iframe]:left-0 [&_iframe]:w-full [&_iframe]:h-[calc(100%+72px)]";

export default function TrailerPlayer({ videoId, poster }: TrailerPlayerProps) {
  return (
    <VideoPlayer>
      <VideoSkin className={HIDE_YOUTUBE_TITLE_BAR}>
        <YouTubeVideo src={videoId} poster={poster} autoplay playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
