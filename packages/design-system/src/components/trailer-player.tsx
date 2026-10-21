import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VideoPlayer } from "@videojs/react/video";

type TrailerPlayerProps = { videoId: string; poster: string };

export default function TrailerPlayer({ videoId, poster }: TrailerPlayerProps) {
  return (
    <div className="size-full [&_iframe]:size-full">
      <VideoPlayer>
        <YouTubeVideo src={videoId} poster={poster} controls={false} autoplay playsInline />
      </VideoPlayer>
    </div>
  );
}
