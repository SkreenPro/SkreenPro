import { Scan, RectangleHorizontal, Monitor, X } from 'lucide-react';
import './CaptureToolbar.css';

function CaptureToolbar() {
  const handleFullScreen = () => {
    window.electronAPI.startCaptureMode('fullscreen');
  };

  const handleWindow = () => {
    window.electronAPI.startCaptureMode('window');
  };

  const handleArea = () => {
    window.electronAPI.startCaptureMode('area');
  };

  const handleCancel = () => {
    window.electronAPI.cancelCapture();
  };

  return (
    <div className="capture-toolbar-container">
      <div className="capture-options">
        <button className="capture-option-btn" onClick={handleArea} title="Capture selected area (Drag to select)">
          <Scan size={18} />
        </button>

        <button className="capture-option-btn" onClick={handleWindow} title="Capture window">
          <RectangleHorizontal size={18} />
        </button>

        <button className="capture-option-btn" onClick={handleFullScreen} title="Capture full screen">
          <Monitor size={18} />
        </button>


       
      </div>
    </div>
  );
}

export default CaptureToolbar;
