import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { cn } from "../lib/cn";
import { useTokenColor } from "../lib/use-token-color";
import { Button } from "./button";
import TrailerPlayer from "./trailer-player";

export type Slide = { kind: "image"; src: string; alt: string } | { kind: "video"; poster: string; videoId: string; alt: string };

export function Gallery({ slides }: { slides: Slide[] }) {
  const onPrimary = useTokenColor("primaryForeground");
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const height = width * 0.625;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
    if (playing !== null && next !== playing) setPlaying(null);
  };

  return (
    <View className="gap-2" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View className="overflow-hidden rounded-xl bg-card" style={{ height }}>
        {width > 0 && (
          <ScrollView horizontal pagingEnabled scrollEnabled={playing === null} showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd} accessibilityLabel="Galeria grafik">
            {slides.map((slide, i) => (
              <View key={i} accessibilityLabel={slide.alt} style={{ width, height }}>
                <Image source={{ uri: slide.kind === "image" ? slide.src : slide.poster }} contentFit="cover" style={{ width, height }} />
                {slide.kind === "video" && playing !== i && (
                  <>
                    <View className="absolute top-4 left-4 rounded-full bg-background px-3 py-1">
                      <Text className="font-display text-[13px] leading-[18px] text-foreground">Zwiastun</Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Odtwórz zwiastun" onPress={() => setPlaying(i)} className="absolute top-1/2 left-1/2 -mt-8 -ml-8 size-16 items-center justify-center rounded-full bg-primary active:opacity-80">
                      <Play color={onPrimary} fill={onPrimary} size={26} />
                    </Pressable>
                  </>
                )}
                {slide.kind === "video" && playing === i && (
                  <View className="absolute inset-0 bg-black">
                    <TrailerPlayer videoId={slide.videoId} width={width} height={height} />
                    <Button size="sm" variant="secondary" className="absolute top-3 right-3" onPress={() => setPlaying(null)}>
                      Zamknij
                    </Button>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
        {slides.length > 1 && playing === null && (
          <View accessibilityElementsHidden className="absolute right-4 bottom-4 rounded-full bg-background px-2.5 py-1">
            <Text className="font-display text-[13px] leading-[18px] text-foreground">
              {index + 1} / {slides.length}
            </Text>
          </View>
        )}
      </View>
      {slides.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5">
          {slides.map((slide, i) => (
            <View key={i} accessibilityLabel={slide.alt} className={cn("h-2 rounded-full", i === index ? "w-5 bg-foreground" : "w-2 bg-input")} />
          ))}
        </View>
      )}
    </View>
  );
}
