import { useAiChat, type AiMessage, type ChatPersistence } from "@playdary/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { streamChat } from "./ai-transport";
import { useSession } from "./session";

type Chat = ReturnType<typeof useAiChat>;

const ChatContext = createContext<Chat | null>(null);

const storageKey = (userId: string) => `playdary:ai-chat:${userId}`;

const persistenceFor = (userId: string): ChatPersistence => ({
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(userId));
      return raw ? (JSON.parse(raw) as AiMessage[]) : [];
    } catch {
      return [];
    }
  },
  save: (messages) => void AsyncStorage.setItem(storageKey(userId), JSON.stringify(messages)),
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const userId = useSession()?.user.id;
  const persistence = useMemo(() => (userId ? persistenceFor(userId) : undefined), [userId]);
  const chat = useAiChat({ transport: streamChat, persistence });
  const previousUser = useRef<string | undefined>(undefined);
  const { clear } = chat;

  useEffect(() => {
    const previous = previousUser.current;
    previousUser.current = userId;
    if (previous && !userId) {
      clear();
      void AsyncStorage.removeItem(storageKey(previous));
    }
  }, [userId, clear]);

  return <ChatContext value={chat}>{children}</ChatContext>;
}

export function useChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useChat needs a ChatProvider");
  return chat;
}
