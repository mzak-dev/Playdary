import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { cn } from "../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity }} className={cn("rounded-md bg-secondary", className)} />;
}
