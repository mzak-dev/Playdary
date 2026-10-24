import { Children, type ReactNode } from "react";
import { Text } from "react-native";

export const wrapText = (children: ReactNode, className: string) =>
  Children.map(children, (child) => (typeof child === "string" || typeof child === "number" ? <Text className={className}>{child}</Text> : child));
