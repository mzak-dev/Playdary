import { flagSetting, useSetting } from "@playdary/core";
import { webStorage } from "./web-storage";

const polishQuotes = flagSetting(webStorage, "playdary:polish-quotes");

export const usePolishQuotes = () => useSetting(polishQuotes);
