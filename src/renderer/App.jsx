import { useState, useEffect } from 'react';
import './App.css';
import CaptureOverlay from './CaptureOverlay';
import CaptureToolbar from './CaptureToolbar';

function App() {
  const [currentView, setCurrentView] = useState('editor'); // 'editor', 'capture', or 'toolbar'
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    // URL hash'e göre view belirle
    const hash = window.location.hash.replace('#', '').replace('/', '');
    console.log('Current hash:', hash);

    if (hash === 'capture') {
      setCurrentView('capture');
    } else if (hash === 'toolbar') {
      setCurrentView('toolbar');
      document.body.classList.add('toolbar-mode');
    }

    // Screenshot yakalandığında dinle
    if (window.electronAPI) {
      window.electronAPI.onScreenshotCaptured((imageData) => {
        setSelectedImage(imageData);
        setShowBackground(false);
        setCurrentView('editor');
      });
    }
  }, []);

  if (currentView === 'toolbar') {
    return <CaptureToolbar />;
  }

  if (currentView === 'capture') {
    return <CaptureOverlay />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Screenshot Editor</h1>
        {!selectedImage && (
          <div className="header-info">
            <p>Press <kbd>Cmd+Shift+5</kbd> or click the menu bar icon to capture</p>
          </div>
        )}
      </header>

      <div className="content">
        {selectedImage ? (
          <div className="editor">
            <div className="editor-toolbar">
              <button onClick={() => setSelectedImage(null)} className="toolbar-btn">
                New Screenshot
              </button>
              <button
                onClick={() => setShowBackground(!showBackground)}
                className={`toolbar-btn ${showBackground ? 'active' : ''}`}
              >
                {showBackground ? 'Hide Background' : 'Show Background'}
              </button>
              <button className="toolbar-btn">Save</button>
              <button className="toolbar-btn">Copy</button>
            </div>
            <div className={`canvas-container ${showBackground ? 'with-background' : ''}`}>
              <img src={selectedImage} alt="Screenshot" className="screenshot" />
            </div>
          </div>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <h2>Welcome to Screenshot Editor</h2>
              <p>Use one of these methods to capture a screenshot:</p>
              <ul>
                <li>Click the menu bar icon</li>
                <li>Press <kbd>Cmd+Shift+5</kbd></li>
                <li>Right-click the menu bar icon and select "Capture Screenshot"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
