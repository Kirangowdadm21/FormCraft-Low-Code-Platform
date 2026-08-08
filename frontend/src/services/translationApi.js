import { translateDynamicText } from "./translateApi";

/**
 * Compatibility wrapper exporting translateText for components importing from translationApi.
 */
export const translateText = translateDynamicText;
