import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, defaultShouldDehydrateQuery, type Query } from "@tanstack/react-query";

export const CACHE_MAX_AGE = 24 * 60 * 60_000;

export const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: CACHE_MAX_AGE } } });

// Sets do not survive JSON, so queries that return them are never persisted
export const shouldPersistQuery = (query: Query) => defaultShouldDehydrateQuery(query) && !(query.state.data instanceof Set);

export const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: "playdary:query-cache" });
