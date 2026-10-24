import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

export const CACHE_MAX_AGE = 24 * 60 * 60_000;

export const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: CACHE_MAX_AGE } } });

export const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: "playdary:query-cache" });
