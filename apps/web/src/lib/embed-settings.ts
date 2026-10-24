import { flagSetting, useSetting } from "@playdary/core";
import { webStorage } from "./web-storage";

const serverEmbeddings = flagSetting(webStorage, "playdary:server-embeddings");

export const useServerEmbeddings = () => useSetting(serverEmbeddings);
