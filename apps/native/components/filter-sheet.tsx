import { GENRES, PERIODS, PLATFORMS, SCORES } from "@playdary/core";
import { Button, Chip, SegmentedControl, Switch } from "@playdary/design-system-native";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Common = { platforms: string[]; genres: string[]; period: (typeof PERIODS)[number]["value"]; minScore: number; sort: string; hideListed: boolean };

type FilterSheetProps<T extends Common> = {
  visible: boolean;
  onClose: () => void;
  filters: T;
  onChange: (filters: T) => void;
  onReset: () => void;
  sorts: readonly { label: string; value: string }[];
  summary?: string;
};

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <View className="gap-2">
    <Text className="font-sans-semibold text-xs leading-4 tracking-wider text-muted-foreground uppercase">{label}</Text>
    {children}
  </View>
);

export function FilterSheet<T extends Common>({ visible, onClose, filters, onChange, onReset, sorts, summary }: FilterSheetProps<T>) {
  const insets = useSafeAreaInsets();
  const set = (patch: Partial<T>) => onChange({ ...filters, ...patch });

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityLabel="Zamknij filtry" onPress={onClose} className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable onPress={() => undefined} className="max-h-[88%] rounded-t-xl bg-popover" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text accessibilityRole="header" className="font-display text-xl text-popover-foreground">
              Filtry
            </Text>
            <Button variant="ghost" size="sm" onPress={onReset}>
              Wyczyść
            </Button>
          </View>
          <ScrollView contentContainerClassName="gap-5 px-5 pb-4">
            <Row label="Platforma">
              <View className="flex-row flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Chip key={p.label} pressed={filters.platforms.includes(p.label)} onPress={() => set({ platforms: toggle(filters.platforms, p.label) } as Partial<T>)}>
                    {p.label}
                  </Chip>
                ))}
              </View>
            </Row>
            <Row label="Gatunek">
              <View className="flex-row flex-wrap gap-2">
                {GENRES.map((g) => (
                  <Chip key={g.label} pressed={filters.genres.includes(g.label)} onPress={() => set({ genres: toggle(filters.genres, g.label) } as Partial<T>)}>
                    {g.label}
                  </Chip>
                ))}
              </View>
            </Row>
            <Row label="Premiera">
              <SegmentedControl
                label="Okres premiery"
                items={PERIODS.map((p) => p.label)}
                value={PERIODS.find((p) => p.value === filters.period)?.label ?? PERIODS[0].label}
                onChange={(label) => set({ period: PERIODS.find((p) => p.label === label)?.value ?? "any" } as Partial<T>)}
              />
            </Row>
            <Row label="Ocena">
              <SegmentedControl
                label="Minimalna ocena"
                items={SCORES.map((s) => s.label)}
                value={SCORES.find((s) => s.value === filters.minScore)?.label ?? SCORES[0].label}
                onChange={(label) => set({ minScore: SCORES.find((s) => s.label === label)?.value ?? 0 } as Partial<T>)}
              />
            </Row>
            <Row label="Sortuj">
              <SegmentedControl
                label="Sortowanie"
                items={sorts.map((s) => s.label)}
                value={sorts.find((s) => s.value === filters.sort)?.label ?? sorts[0]!.label}
                onChange={(label) => set({ sort: sorts.find((s) => s.label === label)?.value ?? sorts[0]!.value } as Partial<T>)}
              />
            </Row>
            <View className="flex-row items-center justify-between gap-4">
              <Text className="flex-1 font-sans-medium text-[15px] text-popover-foreground">Ukryj gry z moich list</Text>
              <Switch label="Ukryj gry z moich list" checked={filters.hideListed} onChange={(hideListed) => set({ hideListed } as Partial<T>)} />
            </View>
          </ScrollView>
          <View className="px-5 pt-2">
            <Button size="lg" onPress={onClose}>
              {summary ? `Pokaż wyniki: ${summary}` : "Gotowe"}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
