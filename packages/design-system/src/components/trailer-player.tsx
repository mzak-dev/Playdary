import "@videojs/react/video/skin.css";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";

type TrailerPlayerProps = { videoId: string; poster: string };

export default function TrailerPlayer({ videoId, poster }: TrailerPlayerProps) {
  return (
    <VideoPlayer>
      <VideoSkin style={{ width: "100%", height: "100%" }}>
        <YouTubeVideo src={videoId} poster={poster} autoplay playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}
