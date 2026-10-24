import YoutubePlayer from "react-native-youtube-iframe";

type TrailerPlayerProps = { videoId: string; width: number; height: number };

export default function TrailerPlayer({ videoId, width, height }: TrailerPlayerProps) {
  return <YoutubePlayer videoId={videoId} width={width} height={height} play webViewProps={{ allowsInlineMediaPlayback: true }} />;
}
