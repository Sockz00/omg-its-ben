import { createContext, useContext } from 'react';
import type { BackgroundSettings } from '@/lib/ascii-settings';

export type PreviewState = {
  settings: BackgroundSettings;
  modelUrl: string;
  modelName: string;
};

export const PreviewContext = createContext<PreviewState | null>(null);
export const usePreview = () => useContext(PreviewContext);
