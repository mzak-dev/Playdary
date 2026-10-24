import { fonts } from "@playdary/tokens";
import Markdown, { sealIncompleteMarkdown } from "@ronradtke/react-native-markdown-display";
import { useMemo } from "react";
import { Linking, Platform } from "react-native";
import { useTokenColor } from "../lib/use-token-color";

const mono = Platform.select({ ios: "Menlo", default: "monospace" });
const SAFE_LINK = /^(https?:|mailto:)/i;

const openSafeLink = (url: string) => {
  if (SAFE_LINK.test(url)) void Linking.openURL(url);
  return false;
};

export function ChatMarkdown({ children }: { children: string }) {
  const foreground = useTokenColor("foreground");
  const muted = useTokenColor("mutedForeground");
  const primary = useTokenColor("primary");
  const border = useTokenColor("border");
  const secondary = useTokenColor("secondary");

  const styles = useMemo(() => {
    const { sans, display } = fonts.native;
    const heading = { fontFamily: display, color: foreground, marginTop: 14, marginBottom: 6 };
    const codeBox = { backgroundColor: secondary, borderColor: border, borderWidth: 1, borderRadius: 12, padding: 12, fontFamily: mono, fontSize: 12, color: foreground };
    return {
      body: { color: foreground, fontFamily: sans, fontSize: 14, lineHeight: 22 },
      paragraph: { marginTop: 0, marginBottom: 10 },
      heading1: { ...heading, fontSize: 24, lineHeight: 30 },
      heading2: { ...heading, fontSize: 20, lineHeight: 26 },
      heading3: { ...heading, fontSize: 17, lineHeight: 23 },
      heading4: { ...heading, fontSize: 15, lineHeight: 21 },
      strong: { fontFamily: fonts.native["sans-bold"], fontWeight: "normal" as const },
      em: { fontStyle: "italic" as const },
      link: { color: primary, textDecorationLine: "underline" as const },
      blockquote: { backgroundColor: "transparent", borderLeftWidth: 2, borderLeftColor: border, marginLeft: 0, paddingLeft: 12, paddingVertical: 0 },
      bullet_list: { marginBottom: 10 },
      ordered_list: { marginBottom: 10 },
      bullet_list_icon: { color: muted, marginRight: 8 },
      ordered_list_icon: { color: muted, marginRight: 8 },
      list_item: { marginBottom: 4 },
      code_inline: { backgroundColor: secondary, borderRadius: 6, paddingHorizontal: 4, fontFamily: mono, fontSize: 12, color: foreground },
      code_block: codeBox,
      fence: codeBox,
      hr: { backgroundColor: border, height: 1, marginVertical: 12 },
      table: { borderColor: border, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
      th: { padding: 6, fontFamily: fonts.native["sans-semibold"], color: muted },
      td: { padding: 6 },
      tr: { borderBottomWidth: 1, borderColor: border, flexDirection: "row" as const },
    };
  }, [foreground, muted, primary, border, secondary]);

  return (
    <Markdown style={styles} onLinkPress={openSafeLink}>
      {sealIncompleteMarkdown(children)}
    </Markdown>
  );
}
