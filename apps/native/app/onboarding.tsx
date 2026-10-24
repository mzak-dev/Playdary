import { Button } from "@playdary/design-system-native";
import { Image } from "expo-image";
import { useRef, useState, type ComponentType } from "react";
import { FlatList, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@playdary/design-system-native";
import { AiIllustration, FriendsIllustration, ListsIllustration, RateIllustration, SearchIllustration } from "../components/onboarding/illustrations";
import { finishOnboarding } from "../lib/settings";

type Slide = { id: string; label: string; title: string; text: string; Illustration: ComponentType };

const SLIDES: Slide[] = [
  { id: "search", label: "Wyszukaj", title: "Znajdź grę, nawet bez tytułu", text: "Wpisz klimat, gatunek albo własny opis. Wyszukiwarka rozumie sens zapytania, nie tylko nazwę.", Illustration: SearchIllustration },
  { id: "rate", label: "Oceń", title: "Oceń w skali od 1 do 10", text: "Zaznacz, w co grałaś lub grałeś i jak bardzo Ci się podobało. Z ocen układa się Twój gust.", Illustration: RateIllustration },
  { id: "lists", label: "Dodaj do listy", title: "Uporządkuj swoją kolekcję", text: "Gram, Chcę zagrać, Ukończone, Porzucone. Obserwuj premiery i patrz, ile zostało do debiutu.", Illustration: ListsIllustration },
  { id: "friends", label: "Znajomi", title: "Graj razem, porównuj gusta", text: "Dodaj znajomych, zobacz co oceniają i w co grają. Sprawdź, jak bardzo zgadzacie się w grach.", Illustration: FriendsIllustration },
  { id: "ai", label: "Asystent AI", title: "Zapytaj asystenta", text: "Opisz nastrój albo ile masz czasu. Asystent poleci grę z katalogu i podpowie, od czego zacząć.", Illustration: AiIllustration },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [height, setHeight] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width));

  const next = () => {
    if (last) return finishOnboarding();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <View className="h-14 flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-2.5">
          <Image source={require("../assets/logo.png")} accessibilityLabel="Playdary" className="size-8 rounded-full" />
          <Text className="font-display-extrabold text-xl tracking-tight text-foreground">Playdary</Text>
        </View>
        {!last && (
          <Button variant="ghost" size="sm" onPress={finishOnboarding}>
            Pomiń
          </Button>
        )}
      </View>

      <FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item: { label, title, text, Illustration } }) => (
          <View style={{ width, height }} className="px-4">
            <View className="flex-1 justify-center py-4">
              <Illustration />
            </View>
            <View className="h-[200px] gap-3">
              <Text className="font-sans-semibold text-[13px] tracking-wider text-primary uppercase">{label}</Text>
              <Text accessibilityRole="header" className="font-display-extrabold text-[30px] leading-[34px] tracking-tight text-foreground">
                {title}
              </Text>
              <Text className="font-sans text-base leading-6 text-muted-foreground">{text}</Text>
            </View>
          </View>
        )}
      />

      <View className="gap-5 px-4 pt-4">
        <View accessibilityLabel={`Slajd ${index + 1} z ${SLIDES.length}`} className="flex-row items-center justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <View key={slide.id} className={cn("h-2 rounded-full", i === index ? "w-6 bg-primary" : "w-2 bg-input")} />
          ))}
        </View>
        <Button size="lg" onPress={next}>
          {last ? "Zaczynij" : "Dalej"}
        </Button>
      </View>
    </View>
  );
}
