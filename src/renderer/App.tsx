import { useState, useRef } from 'react';
import { FolderOpen, Save } from 'lucide-react';
import ImageCanvas from './components/ImageCanvas';
import EditorControls from './components/EditorControls';
import { Button } from './components/ui/button';
import { EditorSettings } from './types';
import Konva from 'konva';

// Extend Window interface for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      openImage: () => Promise<{ success: boolean; data?: string; filename?: string }>;
      saveImage: (data: string) => Promise<{ success: boolean }>;
    };
  }
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const stageRef = useRef<Konva.Stage | null>(null);
  const [settings, setSettings] = useState<EditorSettings>({
    borderWidth: 8,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: 'bg-image',
    padding: 40,
    shadow: false,
    shadowPreset: 'medium',
  });

  const handleOpenImage = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openImage();
      if (result.success && result.data) {
        setSelectedImage(result.data);
        setFilename(result.filename || '');
      }
    }
  };

  const handleSaveImage = async () => {
    if (window.electronAPI && stageRef.current) {
      // Export canvas as base64 image
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2, // Higher quality export
      });

      const result = await window.electronAPI.saveImage(dataURL);
      if (result.success) {
        alert('Image saved successfully!');
      } else {
        alert('Failed to save image');
      }
    }
  };

  const handleExportRef = (ref: React.RefObject<Konva.Stage>) => {
    stageRef.current = ref.current;
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-4 bg-card border-b border-border flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Image Editor</h1>
        <div className="flex gap-3">
          <Button onClick={handleOpenImage} variant="outline" className="gap-2">
            <FolderOpen size={20} />
            Open Image
          </Button>
          {selectedImage && (
            <Button onClick={handleSaveImage} className="gap-2">
              <Save size={20} />
              Save
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {selectedImage ? (
          <div className="flex gap-5 h-full overflow-hidden">
            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <div className="px-6 py-4 bg-card rounded-lg">
                <span className="text-sm text-muted-foreground font-medium">{filename}</span>
              </div>
              <EditorControls settings={settings} onChange={setSettings} />
            </div>

            {/* Canvas Container */}
            <div className="flex-1 flex justify-center items-center rounded-lg overflow-auto relative"
              style={{
                background: 'repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / 20px 20px'
              }}
            >
              <ImageCanvas
                imageSrc={selectedImage}
                settings={settings}
                onExport={handleExportRef}
              />
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center items-center h-full relative"
            style={{
              backgroundImage: 'url(/bg.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[1]" />
            <div className="max-w-[600px] text-center relative z-[2]">
              <h2 className="text-white text-3xl font-semibold mb-5">Welcome to Image Editor</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">Open an image to start editing</p>
              <Button
                onClick={handleOpenImage}
                size="lg"
                className="gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <FolderOpen size={24} />
                Open Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
