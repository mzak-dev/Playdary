import type { ReactNode } from "react";
import { View } from "react-native";
import { wrapText } from "../lib/text-children";

export const Tag = ({ children }: { children: ReactNode }) => (
  <View className="flex-row items-center self-start rounded-full bg-secondary px-3 py-1">{wrapText(children, "font-sans-semibold text-xs leading-[18px] text-secondary-foreground")}</View>
);
