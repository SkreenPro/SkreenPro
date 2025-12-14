export interface EditorSettings {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  backgroundColor: string;
  padding: number;
  shadow: boolean;
  shadowPreset: ShadowPreset;
}

export type ShadowPreset = 'light' | 'medium' | 'heavy' | 'soft' | 'sharp' | 'dramatic';

export interface ShadowSettings {
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface GradientPreset {
  type: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  colorStops: (number | string)[];
}

export interface BackgroundPreset {
  name: string;
  value: string;
}

export interface ImageCanvasProps {
  imageSrc: string;
  settings: EditorSettings;
  onExport: (ref: React.RefObject<any>) => void;
}

export interface EditorControlsProps {
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
}
