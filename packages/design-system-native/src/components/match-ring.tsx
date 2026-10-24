import { Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useTokenColor } from "../lib/use-token-color";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MatchRing({ value }: { value: number | null }) {
  const track = useTokenColor("inputSoft");
  const progress = useTokenColor("primary");
  const percent = value === null ? null : Math.round(value * 100);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Zgodność gustu" accessibilityValue={{ min: 0, max: 100, now: percent ?? undefined }} className="size-28 shrink-0 items-center justify-center">
      <View className="absolute inset-0">
        <Svg viewBox="0 0 100 100" width="100%" height="100%">
          <G rotation={-90} origin="50, 50">
            <Circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={7} stroke={track} />
            {percent !== null && (
              <Circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={7} strokeLinecap="round" stroke={progress} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)} />
            )}
          </G>
        </Svg>
      </View>
      <Text className="font-display-extrabold text-2xl leading-none text-foreground">{percent === null ? "–" : `${percent}%`}</Text>
      <Text className="mt-1 font-sans text-[11px] text-muted-foreground">zgodności</Text>
    </View>
  );
}
