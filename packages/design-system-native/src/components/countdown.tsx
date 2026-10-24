import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ to, compact = false }: { to: number | null; compact?: boolean }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!to) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (!to) return <Text className="font-sans text-[13px] text-muted-foreground">Data premiery: TBA</Text>;
  const diff = to - now;
  if (diff <= 0) return <Text className="font-sans-bold text-sm text-success">Już dostępna</Text>;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (compact) {
    return (
      <Text accessibilityRole="timer" className="font-display text-sm text-primary">
        {days} d {pad(hours)} h {pad(minutes)} m
      </Text>
    );
  }

  const segments = [
    [String(days), "dni"],
    [pad(hours), "godz."],
    [pad(minutes), "min"],
    [pad(seconds % 60), "sek"],
  ] as const;

  return (
    <View accessibilityRole="timer" className="flex-row gap-2">
      {segments.map(([value, unit]) => (
        <View key={unit} className="min-w-14 items-center rounded-md bg-secondary px-1.5 py-2">
          <Text className="font-display text-[28px] leading-7 text-foreground">{value}</Text>
          <Text className="mt-1 font-sans text-[11px] tracking-wider text-muted-foreground uppercase">{unit}</Text>
        </View>
      ))}
    </View>
  );
}
