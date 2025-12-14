import { useState, useRef } from 'react';
import { FolderOpen, Save } from 'lucide-react';
import ImageCanvas from './components/ImageCanvas';
import EditorControls from './components/EditorControls';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filename, setFilename] = useState('');
  const stageRef = useRef(null);
  const [settings, setSettings] = useState({
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
      if (result.success) {
        setSelectedImage(result.data);
        setFilename(result.filename);
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

  const handleExportRef = (ref) => {
    stageRef.current = ref.current;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Image Editor</h1>
        <div className="header-actions">
          <button onClick={handleOpenImage} className="toolbar-btn">
            <FolderOpen size={20} />
            Open Image
          </button>
          {selectedImage && (
            <>
              <button onClick={handleSaveImage} className="toolbar-btn">
                <Save size={20} />
                Save
              </button>
            </>
          )}
        </div>
      </header>

      <div className="content">
        {selectedImage ? (
          <div className="editor">
            <div className="editor-sidebar">
              <div className="editor-info">
                <span className="filename">{filename}</span>
              </div>
              <EditorControls settings={settings} onChange={setSettings} />
            </div>
            <div className="canvas-container">
              <ImageCanvas
                imageSrc={selectedImage}
                settings={settings}
                onExport={handleExportRef}
              />
            </div>
          </div>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <h2>Welcome to Image Editor</h2>
              <p>Open an image to start editing</p>
              <button onClick={handleOpenImage} className="open-btn">
                <FolderOpen size={24} />
                Open Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
